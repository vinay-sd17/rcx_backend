import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class NftBidDto {

  @ApiProperty()
  @IsNotEmpty({message: "ProjectId / Nft Id is required"})
  projectId: string;

  @ApiProperty()
  @IsNotEmpty({message: "Bidder Address is required"})
  bidder: string;

  @ApiProperty()
  @IsNotEmpty({message: "Offer Price for the bid"})
  price: number;
}
