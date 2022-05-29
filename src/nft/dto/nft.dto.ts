import {ApiProperty} from "@nestjs/swagger";
import {NftDocumentDto} from "./nft-document.dto";
import {NftGalleryDto} from "./nft-gallery.dto";
import {ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {NftAuctionDto} from "./nft-auction.dto";
import {NftPurchaseDto} from "./nft-purchase.dto";

const NFT_CATEGORY_PATTERN = /^0|1$/;

export class NftDto {

  _id: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  make: string;

  @ApiProperty()
  engineNo: string;

  @ApiProperty()
  chasisNo: string;

  @ApiProperty()
  fcDate: string;

  @ApiProperty()
  @ValidateNested({each: true})
  @Type(() => NftDocumentDto)
  documents: NftDocumentDto[];

  @ApiProperty()
  @ValidateNested({each: true})
  @Type(() => NftGalleryDto)
  gallery: NftGalleryDto[];

  @ApiProperty()
  price: number;

  owner: string;

  ownerName: string;

  @ApiProperty()
  isAuction: boolean;

  @ApiProperty()
  nftAuction: NftAuctionDto;

  purchaseList: NftPurchaseDto[] = [];

}
