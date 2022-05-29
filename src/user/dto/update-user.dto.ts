import {CreateUserDto} from './create-user.dto';
import {ApiProperty, PartialType} from "@nestjs/swagger";
import {Length} from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {

  @ApiProperty()
  @Length(6, 10, {message: "Password should contain minimum 6 and maximum 10 char"})
  password: string;

}