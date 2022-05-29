import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {mapToResponse} from "../../common/utils";
import {Status} from "../../common/status";
import {NftDto} from "../dto/nft.dto";
import {NftService} from "../service/nft.service";
import {NftCategory} from "../enum/nft-category.enum";
import {NftOwnershipTransferDto} from "../dto/nft-ownership-transfer.dto";
import {ConfigService} from "@nestjs/config";
import {NftBidDto} from "../dto/nft-bid.dto";
import * as moment from 'moment';
import {NftPayoutDto} from "../dto/nft-payout.dto";
import {RcxAuthGaurd} from 'src/auth/guards/rcx-auth-gaurd';

@Controller('api')
@ApiBearerAuth('JWT')
@ApiTags("NFT")
export class NftController {

  private readonly logger = new Logger(NftController.name);

  constructor(private nftService: NftService, private configService: ConfigService) {
  }

  @Post("nft")
  @ApiOperation({summary: 'Publish Project as NFT for RCX'})
  @HttpCode(200)
  @UseGuards(RcxAuthGaurd)
  async create(@Body() nftDto: NftDto) {
    this.logger.log("Entered inside create Project Nft controller");
    try {
      nftDto.owner = this.configService.get("KARDIA_CHAIN_ADDRESS");
      nftDto.ownerName = 'RCX';
      if (nftDto.isAuction)
        nftDto.price = 0;
      if (nftDto.nftAuction) {
        nftDto.nftAuction.expiry = moment(nftDto.nftAuction.expiry).format('MMMM Do YYYY, h:mm:ss a');
      }
      let nftDetails: NftDto = await this.nftService.create(nftDto);
      return mapToResponse(nftDetails, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('nft/static-enum-information/')
  @ApiOperation({summary: 'Get All Enums text used in NFT'})
  @HttpCode(200)
  async getAllMetaObject() {
    let response = {};
    response['nftCategory'] = {};
    let nftCategoryStrings = Object.keys(NftCategory).filter((v) => isNaN(Number(v)));
    nftCategoryStrings.forEach((value) => {
      let index = NftCategory[value];
      response['nftCategory'][index] = value;
    })
    return mapToResponse(response, false, Status.SUCCESS);
  }

  @Post('nft/transfer')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: '(For buy call this) Transfer NFT to another person: Note! This will be deprecated soon after payment gateway integrated)'})
  @HttpCode(200)
  async transferNftOwnership(@Body() nftOwnershipTransferDto: NftOwnershipTransferDto) {
    try {
      let nft = await this.nftService.transferNft(nftOwnershipTransferDto);
      return mapToResponse(nft, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Post('nft/bid')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Transfer NFT to another person: Note! This will be deprecated soon after payment gateway integrated)'})
  @HttpCode(200)
  async bidNft(@Body() nftBidDto: NftBidDto) {
    try {
      let nft = await this.nftService.bidNft(nftBidDto);
      return mapToResponse(nft, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('nft/investment/:id')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Get investment history for an user by wallet address'})
  @HttpCode(200)
  async getInvestmentHistory(@Param('id') id: string) {
    try {
      let investments = await this.nftService.getInvestmentHistory(id);
      return mapToResponse(investments, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('nft/payout')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Payout from RCX for all NFT share holders - Revenue sharing (Deprecating it soon, as this will be of secured end point)'})
  @HttpCode(200)
  async payoutRevenuesToNftHolders(@Query('projectId') projectId: string, @Query('amount') totalAmount: number) {
    try {
      let nft: any = await this.nftService.getNftById(projectId, false);
      for (let i = 0; i < nft.purchaseList.length; i++) {
        let item = nft.purchaseList[i];
        let payout = (item.equityPercentage * totalAmount) / 100;
        let nfyPayoutDto: NftPayoutDto = new NftPayoutDto();
        nfyPayoutDto.payoutAmount = payout;
        nfyPayoutDto.payoutDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        nfyPayoutDto.transactionSummary = await this.nftService.onChainPayout(JSON.stringify(payout), item.owner);
        delete nfyPayoutDto.transactionSummary.receipt.logsBloom;
        item.payoutHistories.push(nfyPayoutDto);
      }
      await this.nftService.updateNft(projectId, nft);
      return mapToResponse({message: "Payout for all NFT Purchase holder are success."}, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('nft')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Get all NFTs registered in RCX application.'})
  @HttpCode(200)
  async findAll() {
    try {
      let allNft = await this.nftService.getAllNftByCategory(null);
      return mapToResponse(allNft, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }

  @Get('nft/:id')
  @UseGuards(RcxAuthGaurd)
  @ApiOperation({summary: 'Get NFT by id'})
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    try {
      let nft = await this.nftService.getNftById(id, true);
      return mapToResponse(nft, false, Status.SUCCESS);
    } catch (err) {
      this.logger.error(err);
      return mapToResponse(err, true, Status.FAILURE)
    }
  }
}
