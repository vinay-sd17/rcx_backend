import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class MetamaskDetails {

  @ApiProperty()
  nonce: number;

  @ApiProperty()
  @IsNotEmpty({message: "Wallet Public Address is required"})
  walletAddress: string;
}
