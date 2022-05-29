import {ApiProperty} from "@nestjs/swagger";

export class NftAuctionHistoryDto {

  owner: string;

  bidPrice: string;

  date: string;

}
