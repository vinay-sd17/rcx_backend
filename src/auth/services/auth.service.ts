import {Injectable, Logger} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {ConfigService} from "@nestjs/config";
import {User} from "../../user/entities/user.entity";

const bcrypt = require('bcrypt');
const CryptoTS = require("crypto-ts");

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwtService: JwtService,
              private readonly configService: ConfigService) {
  }

  async generateJWT(userObj: User) {
    delete userObj.emailOtp;
    delete userObj.phoneOtp;
    delete userObj.deleted;
    if (this.configService.get('ENCRYPT_JWT_USER_OBJ') === 'true') {
      let userJson = JSON.stringify(userObj);
      let user = CryptoTS.AES.encrypt(userJson, this.configService.get('JWT_SECRET')).toString();
      return this.jwtService.signAsync({user});
    }
    return this.jwtService.signAsync({userObj});
  }

  verifyJwtToken(token: any) {
    token = token.toString().replace("Bearer ", "");
    try {
      this.jwtService.verify(token);
      return token;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  getuserFromJwtToken(request: any) {
    let headers = request.headers;
    let token = headers.authorization;
    if (token) {
      token = this.verifyJwtToken(token);
      if (token) {
        let decoded: any = this.jwtService.decode(token);
        if (this.configService.get('ENCRYPT_JWT_USER_OBJ') === 'true') {
          let bytes = CryptoTS.AES.decrypt(decoded.encryptedUserObject, this.configService.get('JWT_SECRET'));
          let user = bytes.toString(CryptoTS.enc.Utf8);
          return JSON.parse(user);
        }
        return decoded.userObj;
      }
    }
    return null;
  }

  comparePasswords(newPassword: string, passwordHash: string): Promise<any> {
    return bcrypt.compare(newPassword, passwordHash);
  }

}
