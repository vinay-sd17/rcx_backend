import {ApiProperty} from "@nestjs/swagger";
import {NftAuctionHistoryDto} from "./nft-auction-history.dto";

export class NftAuctionDto {

  @ApiProperty()
  expiry: string;

  @ApiProperty()
  startingBidPrice: string;

  lastBidPrice: string;

  recentBidder: string;

  @ApiProperty()
  nftAuctionHistories: NftAuctionHistoryDto[];

}
