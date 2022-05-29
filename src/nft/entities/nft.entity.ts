import {NftDocumentEntity} from "./nft-document.entity";
import {NftGalleryEntity} from "./nft-gallery.entity";
import {BaseEntity} from "../../common/base.entity";
import {Column, Entity} from "typeorm";
import {NftOwnershipHistoryEntity} from "./nft-ownership-history.entity";
import {NftAuctionEntity} from "./nft-auction.entity";
import {NftPurchaseEntity} from "./nfy-purchase.entity";
import {NftCategory} from "../enum/nft-category.enum";

@Entity({name: "nft"})
export class NftEntity extends BaseEntity {

  @Column()
  color: string;

  @Column()
  version: string;

  @Column()
  model: string;

  @Column()
  make: string;

  @Column()
  engineNo: string;

  @Column()
  chasisNo: string;

  @Column()
  fcDate: string;

  @Column()
  documents: [NftDocumentEntity];

  @Column()
  gallery: [NftGalleryEntity];

  @Column()
  price: number;

  @Column()
  owner: string;

  @Column()
  ownerName: string;

  @Column()
  pastOwners: NftOwnershipHistoryEntity[];

  @Column()
  isAuction: boolean;

  @Column()
  nftAuction: NftAuctionEntity;

  @Column()
  purchaseList: NftPurchaseEntity[] = [];

  @Column()
  nftCategory: NftCategory;

}
