import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, Length, Matches} from "class-validator";
import {MetamaskDetails} from "./metamask-details";

export const MOB_NUMBER_PATTERN = /[6-9][0-9]{9}/;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({message: "First Name is required"})
  @Length(3, 50, {message: "First Name should contain minimum 3 and maximum 50 char"})
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({message: "Last Name is required"})
  @Length(1, 50, {message: "Last Name should contain minimum 1 and maximum 50 char"})
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({message: "Email is required"})
  @IsEmail({}, {message: "Email is not valid"})
  email: string;

  @ApiProperty()
  @IsNotEmpty({message: "Password is required"})
  @Length(6, 10, {message: "Password should contain minimum 8 and maximum 10 char"})
  @Matches(PASSWORD_PATTERN, {message: "Password should contain minimum 8 character & Should have atleast 1 letter, 1 number and 1 special character"})
  password: string;

  @ApiProperty()
  @IsNotEmpty({message: "Phone number is required"})
  @Matches(MOB_NUMBER_PATTERN, {message: `Phone number is not valid. Should contain 10 digits`})
  phone: string;

  metaMaskDetails: MetamaskDetails;

  profilePhotoUrl: string
}
