import {forwardRef, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {JwtAuthGuard} from './guards/jwt-guard';
import {JwtStrategy} from './guards/jwt-strategy';
import {AuthService} from './services/auth.service';
import {SecurityContextService} from "./services/security-context.service";
import {UserModule} from "../user/user.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        property: configService.get('JWT_OBJECT_KEY'),
        signOptions: {expiresIn: '10h'}
      })
    })
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, SecurityContextService],
  exports: [AuthService, SecurityContextService]
})
export class AuthModule {
}
