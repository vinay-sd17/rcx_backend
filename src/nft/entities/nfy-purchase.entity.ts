import {NftPayoutEntity} from "./nft-payout.entity";

export class NftPurchaseEntity {
  owner: string;
  purchasedOn: string;
  purchasedPrice: number;
  equityPercentage: number;
  payoutHistories: NftPayoutEntity[] = []
}
