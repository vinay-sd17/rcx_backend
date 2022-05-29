import {HttpService, Injectable} from '@nestjs/common';
import {plainToClass} from 'class-transformer';
import {AuthService} from 'src/auth/services/auth.service';
import {ConfigService} from "@nestjs/config";
import {SecurityContextService} from "../../auth/services/security-context.service";
import {UserRepository} from "../repository/user.repository";
import {CreateUserDto} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";
import {User} from "../entities/user.entity";
import {LoginDto, TokenDto} from "../dto/user-login";
import RcxException from "../../common/exception/rcx.exception";

@Injectable()
export class UserService {
  constructor(private authService: AuthService,
              private httpService: HttpService, private configService: ConfigService,
              private securityContextService: SecurityContextService) {
  }

  private readonly userRepository: UserRepository = new UserRepository(this.securityContextService);

  create(createUserDto: CreateUserDto) {
    const user = plainToClass(User, createUserDto);
    return this.userRepository.saveEntity(user);
  }

  sendOtp(message: string, phone: string) {
    let url = this.configService.get('MSG91_URL') + 'sendsms?authkey=' + this.configService.get('MSG91_AUTH_KEY') + '&mobiles='
        + phone + '&message=' + message + '&sender=' + this.configService.get('MSG91_SENDER_ID') + '&route='
        + this.configService.get('MSG91_ROUTE') + '&country=' + this.configService.get('MSG91_COUNTRY_CODE');
    return this.httpService.get(url).toPromise();
  }

  findAll() {
    return this.userRepository.getAllEntity();
  }

  findOne(id: string) {
    return this.userRepository.getEntity(id);
  }

  findOneByWalletAddress(address: string) {
    return this.userRepository.getEntityByWalletAddress(address);
  }


  findOneByEmail(email: string) {
    return this.userRepository.getEntityByEmail(email);
  }

  update(id: string, updateUserDto: UpdateUserDto, fromUpdateControllerAction?: boolean) {
    const user = plainToClass(User, updateUserDto);
    if (fromUpdateControllerAction)
      this.cleanUserData(user, fromUpdateControllerAction)
    return this.userRepository.updateEntity(id, user);
  }

  linkMetamaskWalletToUser(id: string, updateUserDto: UpdateUserDto) {
    const user = plainToClass(User, updateUserDto);
    return this.userRepository.updateEntity(id, user);
  }

  remove(id: string) {
    return this.userRepository.removeEntity(id);
  }

  async login(user: LoginDto) {
    let savedUser: User = await this.userRepository.getUserByEmail(user.email);
    if (savedUser) {
      if (await this.authService.comparePasswords(user.password, savedUser.password)) {
        this.cleanUserData(savedUser);
        const token = await this.authService.generateJWT(savedUser);
        return new TokenDto(token);
      }
    }
    throw new RcxException("Login failed, Please enter valid credentials", 401);
  }

  async changePassword(userId: string, existingPassword: string, newPassword: string) {
    let savedUser: User = await this.userRepository.getEntity(userId);
    if (savedUser) {
      if (await this.authService.comparePasswords(existingPassword, savedUser.password)) {
        savedUser.password = newPassword;
        return await this.userRepository.updatePassword(savedUser)
      }
    }
    throw new RcxException("Change password failed, Please enter valid credentials");
  }

  cleanUserData(user: User, fromUpdateControllerAction?: boolean) {
    delete user.createdAt;
    delete user.updatedAt;
    delete user.createdBy;
    delete user.updatedBy;
    if (fromUpdateControllerAction) {
      delete user.deleted;
      delete user.emailOtp;
      delete user.phone;
      delete user.emailVerified;
      delete user.phoneVerified;
      delete user.phoneOtp;
      delete user.emailOtp;
    } else {
      delete user.password;
    }
  }

}
