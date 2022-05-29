import {Body, Controller, Get, HttpCode, Logger, Param, Post, Query} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserService} from "../service/user.service";
import {ConfigService} from "@nestjs/config";
import {MetamaskDetails} from "../dto/metamask-details";
import {CreateUserDto} from "../dto/create-user.dto";
import {User} from "../entities/user.entity";
import {mapToResponse} from "../../common/utils";
import {Status} from "../../common/status";
import {plainToClass} from "class-transformer";
import {UpdateUserDto} from "../dto/update-user.dto";
import { bufferToHex } from 'ethereumjs-util';
import { recoverPersonalSignature } from 'eth-sig-util';
import {TokenDto} from "../dto/user-login";
const jwt = require('jsonwebtoken');

@Controller('api/metamask')
@ApiBearerAuth('JWT')
export class MetamaskController {

  private readonly logger = new Logger(MetamaskController.name);

  constructor(private readonly usersService: UserService,
              private configService: ConfigService) {
  }

  //1: step
  @Get('user/wallet/:address')
  @ApiTags("Metamask")
  @ApiOperation({summary: 'Step 1 - Pass Metamask Address, if address not exists api will create a user & respond user details, else existing user details will be in response'})
  @HttpCode(200)
  async checkIfUserExistsWithMetaMaskAddress(@Param('address') address: string) {
    try {
      let user = await this.usersService.findOneByWalletAddress(address);
      if (user == null) {
        let metamaskDetails: MetamaskDetails = new MetamaskDetails();
        metamaskDetails.walletAddress = address;
        let userDto: CreateUserDto = new CreateUserDto();
        userDto.metaMaskDetails = metamaskDetails;
        user = await this.usersService.create(userDto);
        this.removeMetaProperties(user);
      }
      this.removeMetaProperties(user);
      return mapToResponse(user, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Post('user/signature/:address')
  @ApiTags("Metamask")
  @ApiOperation({summary: 'Step 2: Expecting Metamask signature created with - Signing into IPX with a one-time nonce:12345'})
  @HttpCode(200)
  async processSignedMessage(@Param('address') address: string, @Query('signature') signature: string) {
    try {
      let user: User = await this.usersService.findOneByWalletAddress(address);
      if (user === undefined || user === null) {
        return mapToResponse({message: "User does not exist."}, true, Status.FAILURE);
      } else {
        const msg = `Signing into IPX with an one-time nonce:${user.metaMaskDetails.nonce}`;
        const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
        const publicAddress = recoverPersonalSignature({
          data: msgBufferHex,
          sig: signature,
        });
        if (address.toLowerCase() === publicAddress.toLowerCase()) {
          user.metaMaskDetails.nonce = Math.floor(Math.random() * 1000000);
          let updateUserDto = plainToClass(UpdateUserDto, user);
          await this.usersService.update(user._id, updateUserDto);
          const jwtToken = jwt.sign({
            _id: user._id,
            address: user.metaMaskDetails.walletAddress
          }, process.env.JWT_SECRET, {expiresIn: '10h'});
          return mapToResponse(new TokenDto(jwtToken), false, Status.SUCCESS);
        } else {
          return mapToResponse({message: "Oops signature or nounce is not valid. Please re sign."}, true, Status.FAILURE);
        }
      }
    } catch (err) {
      return mapToResponse(err, true, Status.FAILURE)
    }
  }


  @Post('link/:userId')
  @ApiTags("Metamask")
  @ApiOperation({summary: 'Link Metamask wallet to existing user'})
  @HttpCode(200)
  async createMetamaskUser(@Param('userId') userId: string, @Body() metamaskDetails: MetamaskDetails) {
    try {
      let user = await this.usersService.findOne(userId);
      metamaskDetails.nonce = Math.floor(Math.random() * 1000000);
      user.metaMaskDetails = metamaskDetails;
      await this.usersService.linkMetamaskWalletToUser(userId, plainToClass(UpdateUserDto, user));
      return mapToResponse(user, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  removeMetaProperties(data: any) {
    if (this.configService.get('DEVELOPMENT') === 'true') {
      return;
    }
    delete data.password;
    delete data.phoneOtp;
    delete data.emailOtp;
    delete data.tenantId;
    delete data.deleted;
  }
}
