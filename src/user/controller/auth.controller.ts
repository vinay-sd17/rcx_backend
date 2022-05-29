import {
  Body,
  Controller,
  Get, HttpCode, Logger,
  Param,
  Post,
  Query, UseGuards
} from '@nestjs/common';
import {PASSWORD_PATTERN} from "../dto/create-user.dto";
import {LoginDto, TokenDto} from "../dto/user-login";
import {UpdateUserDto} from "../dto/update-user.dto";
import {Status} from "../../common/status";
import {mapToResponse} from "../../common/utils";
import {plainToClass} from "class-transformer";
import {User} from "../entities/user.entity";
import {ConfigService} from "@nestjs/config";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserService} from "../service/user.service";
import * as randomString from "randomstring";
import {ChangePasswordDto} from "../dto/change-password.dto";
import {RcxAuthGaurd} from "../../auth/guards/rcx-auth-gaurd";

const bcrypt = require('bcrypt');

@Controller('api')
@ApiTags("Auth")
@ApiBearerAuth('JWT')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly usersService: UserService,
              private configService: ConfigService) {
  }

  @Get('send-otp/:id')
  @ApiOperation({summary: 'Send OTP to registered user'})
  @HttpCode(200)
  async sendOtp(@Param('id') id: string) {
    try {
      let user = await this.usersService.findOne(id);
      let text = user.phoneOtp + ' is your mobile verification code - IPX';
      //send to mob otp after user registered
      let otp = await this.usersService.sendOtp(text, user.phone);
      return mapToResponse({message: "Otp sent to your mobile."}, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('verify-otp/:id')
  @ApiOperation({summary: 'Verify OTP to access ScSc features'})
  @HttpCode(200)
  async verifyOtp(@Param('id') id: string, @Query('mob-otp') mobOtp: number, @Query('email-otp') emailOtp: number) {
    try {
      let anyUpdate = false;
      let user: User = await this.usersService.findOne(id);
      if (!isNaN(mobOtp) && user.phoneOtp === Number(mobOtp)) {
        user.phoneVerified = true;
        anyUpdate = true;
      }
      if (!isNaN(emailOtp) && user.emailOtp === Number(emailOtp)) {
        user.emailVerified = true;
        anyUpdate = true;
      }
      if (anyUpdate) {
        let updateUserDto = plainToClass(UpdateUserDto, user);
        await this.usersService.update(id, updateUserDto);
        this.removeMetaProperties(user);
        return mapToResponse(user, false, Status.SUCCESS);
      } else {
        return mapToResponse({message: "OTP entered is not valid."}, true, Status.FAILURE);
      }
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Post('login')
  @ApiOperation({summary: 'Login User into the portal'})
  @HttpCode(200)
  async login(@Body() userDto: LoginDto) {
    try {
      let tokenDto = await this.usersService.login(userDto);
      return mapToResponse(tokenDto, false, Status.SUCCESS)
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Post('forgot-password')
  @ApiOperation({summary: 'forgot password'})
  @HttpCode(200)
  async forgotPassword(@Query("email") email: string) {
    try {
      let user = await this.usersService.findOneByEmail(email);
      let newPassword = randomString.generate({
        length: 8,
        custom: PASSWORD_PATTERN
      });

      user.password = await bcrypt.hash(newPassword, 12)
      user.forcePasswordChange = true;
      let updateUserDto = plainToClass(UpdateUserDto, user);
      await this.usersService.update(user._id, updateUserDto);
      let response = {
        message: "New Password has been sent to your registered Email & Phone.",
        password: newPassword
      };
      if (this.configService.get('DEVELOPMENT') === 'false') {
        delete response.password;
      }

      return mapToResponse(response, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Post('change-password')
  @ApiOperation({summary: 'Change password'})
  @UseGuards(RcxAuthGaurd)
  @HttpCode(200)
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      await this.usersService.changePassword(changePasswordDto.userId, changePasswordDto.oldPassword, changePasswordDto.newPassword);
      return mapToResponse({message: "Password changed successfully"}, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  removeMetaProperties(data: any) {
    delete data.password;
    if (this.configService.get('DEVELOPMENT') === 'true') {
      return;
    }
    delete data.phoneOtp;
    delete data.emailOtp;
    delete data.tenantId;
    delete data.deleted;
  }
}
