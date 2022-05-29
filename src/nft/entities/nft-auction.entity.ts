import {NftAuctionHistoryEntity} from "./nft-auction-history.entity";

export class NftAuctionEntity {

  expiry: string;

  startingBidPrice: number = 0;

  lastBidPrice: number = 0;

  recentBidder: string;

  recentBidDate: string;

  nftAuctionHistories: NftAuctionHistoryEntity[];

}
