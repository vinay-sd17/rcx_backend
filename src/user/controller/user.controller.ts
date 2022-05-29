import {
  Body,
  Controller,
  Delete,
  Get, HttpCode, Logger,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import {CreateUserDto, PASSWORD_PATTERN} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";
import {Status} from "../../common/status";
import {mapToResponse} from "../../common/utils";
import {plainToClass} from "class-transformer";
import {UserDetails} from "../dto/user-details";
import {User} from "../entities/user.entity";
import {ConfigService} from "@nestjs/config";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserService} from "../service/user.service";
import {RcxAuthGaurd} from "../../auth/guards/rcx-auth-gaurd";

@Controller('api')
@ApiBearerAuth('JWT')
@ApiTags("User")
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly usersService: UserService,
              private configService: ConfigService) {
  }

  @Post('user')
  @ApiOperation({summary: 'Signup for IPX'})
  @HttpCode(200)
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log("Entered inside Create User controller");
    try {
      let user: User = await this.usersService.create(createUserDto);
      this.removeMetaProperties(user);
      return mapToResponse(user, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('users')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Get all registered USERS of IPX application. Please note, this endpoint is accessible only for ADMIN'})
  @HttpCode(200)
  async findAll() {
    try {
      let users = await this.usersService.findAll();
      users.forEach(user => {
        this.removeMetaProperties(user);
      });
      const usersDto = plainToClass(UserDetails, users);
      return mapToResponse(usersDto, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('user/:id')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Get user by user id'})
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    try {
      let users = await this.usersService.findOne(id);
      this.removeMetaProperties(users);
      return mapToResponse(users, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Put('user/:id')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Update user details by user id'})
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      let users = await this.usersService.update(id, updateUserDto, true);
      this.removeMetaProperties(users);
      return mapToResponse(users, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Delete('user/:id')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Remove user details by user id'})
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    try {
      let users = await this.usersService.remove(id);
      this.removeMetaProperties(users);
      return mapToResponse(users, false, Status.SUCCESS);
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
