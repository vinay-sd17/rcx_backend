import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, Length, Matches} from "class-validator";
import {PASSWORD_PATTERN} from "./create-user.dto";

export class ChangePasswordDto {

  @ApiProperty()
  @IsNotEmpty({message: "User is required"})
  userId: string;

  @ApiProperty()
  @IsNotEmpty({message: "Old Password is required"})
  @Length(6, 10, {message: "Password should contain minimum 6 and maximum 10 char"})
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty({message: "New Password is required"})
  @Length(6, 10, {message: "New Password should contain minimum 8 and maximum 10 char"})
  @Matches(PASSWORD_PATTERN, {message: "New Password should contain minimum 8 character & Should have atleast 1 letter, 1 number and 1 special character"})
  newPassword: string;

}
