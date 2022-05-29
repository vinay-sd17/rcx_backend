import {ApiProperty} from "@nestjs/swagger";
import {BaseEntity} from "../../common/base.entity";

export class UserDetails extends BaseEntity {

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

}
