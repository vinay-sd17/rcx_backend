import {NftPayoutDto} from "./nft-payout.dto";

export class NftPurchaseDto {
  owner: string;
  purchasedOn: string;
  purchasedPrice: number;
  equityPercentage: number;
  payoutHistories: NftPayoutDto[] = [];
}
