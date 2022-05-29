import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {AuthService} from "../services/auth.service";
import {SecurityContextService} from "../services/security-context.service";
import {User} from "../../user/entities/user.entity";
import {UserService} from "../../user/service/user.service";

@Injectable()
export class RcxAuthGaurd implements CanActivate {

  private readonly logger = new Logger(RcxAuthGaurd.name);

  constructor(private readonly reflector: Reflector,
              private authService: AuthService,
              private securityContextService: SecurityContextService,
              @Inject(forwardRef(() => UserService))
              private userService: UserService) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    let userDetails: User = JSON.parse(JSON.stringify(this.authService.getuserFromJwtToken(request)));
    if (userDetails) {
      let userDetailsFromDb: User = null;
      try {
        userDetailsFromDb = await this.userService.findOne(userDetails._id.toString());
      } catch (e) {
        this.logger.error(e);
      }
      if (userDetailsFromDb && !userDetailsFromDb.deleted && userDetailsFromDb.phoneVerified) {
        this.securityContextService.setUserDetails(userDetails);
        if (!roles && userDetailsFromDb.userType !== undefined
            //&& userDetailsFromDb.userType === UserType.ADMIN
        ) {
          return true;
        }
        return roles !== undefined && roles.some(r => r === userDetailsFromDb.userType);
      }
    }
    return false;
  }
}
