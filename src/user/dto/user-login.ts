import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, Length, Matches} from "class-validator";
import {PASSWORD_PATTERN} from "./create-user.dto";

export class LoginDto {
  @ApiProperty({format: "email"})
  @IsNotEmpty({message: "Email is required"})
  @IsEmail({}, {message: "Email is not valid"})
  email: string;

  @ApiProperty()
  @IsNotEmpty({message: "Password is required"})
  password: string;

}

export class TokenDto {
  constructor(private token: string, private expiry: string = "10h", private type: string = "Bearer") {
  }
}
