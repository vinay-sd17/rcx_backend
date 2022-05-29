import {Injectable} from "@nestjs/common";
import {User} from "../../user/entities/user.entity";

@Injectable()
export class SecurityContextService {

  private user: User;

  private tenant: string;

  constructor() {
  }

  setUserDetails(user: User) {
    this.user = user;
  }

  getUserDetails() {
    return this.user;
  }

  setTenantDetails(tenant: string) {
    this.tenant = tenant;
  }

  getTenantDetails() {
    return "default"; //this.tenant;
  }
}
