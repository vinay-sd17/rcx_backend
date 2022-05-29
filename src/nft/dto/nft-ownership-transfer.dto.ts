import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class NftOwnershipTransferDto {

  @ApiProperty()
  @IsNotEmpty({message: "ProjectId / Nft Id is required"})
  projectId: string;

  @ApiProperty()
  @IsNotEmpty({message: "Current Owner Address is required"})
  currentOwner: string;

  @ApiProperty()
  @IsNotEmpty({message: "New Owner Address is required"})
  newOwner: string;

  @ApiProperty()
  checkAddressBeforeTransfer: boolean;
}
