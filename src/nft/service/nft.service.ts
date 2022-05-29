import {HttpService, Injectable, Logger} from '@nestjs/common';
import {plainToClass} from "class-transformer";
import {NftDto} from "../dto/nft.dto";
import {AuthService} from "../../auth/services/auth.service";
import {ConfigService} from "@nestjs/config";
import {SecurityContextService} from "../../auth/services/security-context.service";
import {NftRepository} from "../repository/nft.repository";
import {NftEntity} from "../entities/nft.entity";
import {NftGalleryEntity} from "../entities/nft-gallery.entity";
import {v4} from "uuid";
import {UserService} from "../../user/service/user.service";
import {NftOwnershipTransferDto} from "../dto/nft-ownership-transfer.dto";
import {NftBidDto} from "../dto/nft-bid.dto";
import {NftAuctionHistoryEntity} from "../entities/nft-auction-history.entity";
import * as moment from 'moment';
import {NftPurchaseEntity} from "../entities/nfy-purchase.entity";
import RcxException from "../../common/exception/rcx.exception";

/* TODO Move the below one to common injectable service */
// ***** changing IS_KARDIACHAIN Then Change in truffle config also *****
var IS_KARDIACHAIN = true;
const Web3 = require('web3');
const artifacts = require('../../../build/contracts/IpxNft.json');
const HDWalletProvider = require('@truffle/hdwallet-provider');

var web3: any;
if (!IS_KARDIACHAIN) {
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"))
} else {
  const mnemonic = "spell kidney notable arrow machine elegant crumble random knee furnace produce bargain";
  const provider = new HDWalletProvider(mnemonic, "https://dev.kardiachain.io");
  web3 = new Web3(provider);
}
const contract = require('truffle-contract');
const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)

@Injectable()
export class NftService {

  constructor(private authService: AuthService,
              private httpService: HttpService, private configService: ConfigService,
              private userService: UserService,
              private securityContextService: SecurityContextService) {
  }

  private readonly nftRepository: NftRepository = new NftRepository(this.securityContextService);
  private readonly logger = new Logger(NftService.name);

  account: string;
  lms: any;

  async create(nftDto: NftDto) {
    const nft = plainToClass(NftEntity, nftDto);
    nft._id = v4();

    //initiate Blockchain actions
    await this.initContractCreationForProject(nft);

    let nftEntity = await this.nftRepository.createNft(nft);
    return plainToClass(NftDto, nftEntity);
  }

  async getAllNftByCategory(category: string) {
    let nftEntities = await this.nftRepository.getAllNftByCategory(category);
    return plainToClass(NftDto, nftEntities);
  }

  async getNftById(id: string, convertToDto: boolean) {
    await this.onChainGetNftByProjectId(id);
    let nftEntity: NftEntity = await this.nftRepository.getNftById(id);
    if (convertToDto)
      return plainToClass(NftDto, nftEntity);
    return nftEntity;
  }

  async updateNft(id: string, nftEntity: NftEntity) {
    return await this.nftRepository.updateNft(id, nftEntity);
  }

  async transferNft(nftOwnershipTransferDto: NftOwnershipTransferDto) {
    let nftEntity = await this.nftRepository.getNftById(nftOwnershipTransferDto.projectId);
    if (nftEntity.owner !== nftOwnershipTransferDto.currentOwner)
      throw new RcxException("Oops, You are not owning this NFT inorder to make a ownership transfer");
    if (nftOwnershipTransferDto.checkAddressBeforeTransfer) {
      let user = await this.userService.findOneByWalletAddress(nftOwnershipTransferDto.newOwner);
      if (user === null || user === undefined)
        throw new RcxException("No user found with address: " + nftOwnershipTransferDto.newOwner);
    }
    let purchaseObj = new NftPurchaseEntity();
    purchaseObj.owner = nftOwnershipTransferDto.newOwner;
    purchaseObj.purchasedOn = moment().format('MMMM Do YYYY, h:mm:ss a');
    purchaseObj.purchasedPrice = nftEntity.price;
    nftEntity.purchaseList.push(purchaseObj);
    await this.nftRepository.updateNft(nftOwnershipTransferDto.projectId, nftEntity);
    await this.onChainTransferProjectNftOwnership(nftOwnershipTransferDto.currentOwner, nftOwnershipTransferDto.newOwner,
        nftOwnershipTransferDto.projectId);
    return purchaseObj;
  }

  async bidNft(nftBidDto: NftBidDto) {
    let nftEntity = await this.nftRepository.getNftById(nftBidDto.projectId);
    let isFirstPersonToBid = false;

    let initialPrice = nftEntity.nftAuction.lastBidPrice ? nftEntity.nftAuction.lastBidPrice : 0;
    if (nftEntity.nftAuction.nftAuctionHistories === undefined || nftEntity.nftAuction.nftAuctionHistories === null) {
      nftEntity.nftAuction.nftAuctionHistories = [];
      isFirstPersonToBid = true;
    }
    this.validateBidding(nftEntity, nftBidDto, isFirstPersonToBid);
    let date = moment().format('MMMM Do YYYY, h:mm:ss a');
    //Adding in bid history
    let nftAuctionHistoryEntity: NftAuctionHistoryEntity = new NftAuctionHistoryEntity();
    nftAuctionHistoryEntity.owner = nftBidDto.bidder;
    nftAuctionHistoryEntity.bidPrice = nftBidDto.price;
    nftAuctionHistoryEntity.bidDate = date;
    nftEntity.nftAuction.nftAuctionHistories.push(nftAuctionHistoryEntity);

    //setting it recent bid value
    nftEntity.nftAuction.lastBidPrice = nftBidDto.price;
    nftEntity.nftAuction.recentBidder = nftBidDto.bidder;
    nftEntity.nftAuction.recentBidDate = date;

    //refund prev bidder amount
    if (nftEntity.nftAuction.nftAuctionHistories.length > 1) {
      let toRefundBidPerson = nftEntity.nftAuction.nftAuctionHistories[nftEntity.nftAuction.nftAuctionHistories.length - 2];
      let tx = await this.onChainPayout(JSON.stringify(toRefundBidPerson.bidPrice), toRefundBidPerson.owner);
      delete tx.receipt.logsBloom;
      toRefundBidPerson.transactionSummary = tx;
    }
    await this.nftRepository.updateNft(nftBidDto.projectId, nftEntity);

    return nftEntity;
  }

  validateBidding(nftEntity: NftEntity, nftBidDto: NftBidDto, isFirstPersonToBid: boolean) {
    if (nftEntity.isAuction === undefined || nftEntity.isAuction === false) {
      throw new RcxException("Error, NFT is not enabled for bidding");
    }

    if (isFirstPersonToBid && nftBidDto.price <= nftEntity.nftAuction.startingBidPrice) {
      throw new RcxException("Error, New bid should be higher than the starting bid price: " + nftEntity.nftAuction.startingBidPrice);
    }

    if (moment() > moment(nftEntity.nftAuction.expiry)) {
      throw new RcxException("Error, Not allowed to bid on expired auction.");
    }

    if (nftBidDto.price <= 0) {
      throw new RcxException("Error, Bid should be non negative or zero");
    }

    if (nftBidDto.price <= nftEntity.nftAuction.lastBidPrice) {
      throw new RcxException("Error, New bid should be higher than the last bid price");
    }
  }

  getInvestmentHistory(walletAddress: string) {
    return this.nftRepository.getInvestmentHistory(walletAddress);
  }

  async initContractCreationForProject(nft: NftEntity) {
    const projectId = nft._id;
    //setting up gallery
    if (nft.gallery.length > 0) {
      for (const g of nft.gallery) {
        await this.onChainAddGalleryItem(projectId, g);
      }
    }
    //creating nft gallery
    await this.onChainCreateNft(projectId, nft);
  }

  async prepareTruffle() {
    if (!IS_KARDIACHAIN) {
      let accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } else {
      this.account = this.configService.get("KARDIA_CHAIN_ADDRESS");
    }
    this.lms = await LMS.deployed();
  }

  /*
   * ON CHAIN ACTION ITEMS
   */

  async onChainAddGalleryItem(projectId: string, galleryEntity: NftGalleryEntity) {
    try {
      this.logger.log("Started adding gallery items for Project: " + projectId);
      await this.prepareTruffle();
      let nft = await this.lms.addItemToGallery(projectId, galleryEntity.fileName, galleryEntity.fileUrl, {from: this.account});
      this.logger.log(JSON.stringify(nft));
      this.logger.log("Completed adding gallery items for Project: " + projectId);
    } catch (e) {
      this.logger.error(e);
      if (this.configService.get("BLOCK_ON_FAILED_CHAIN_ACTIONS") !== "false")
        throw new RcxException("Error while uploading NFT Gallery items to BlockChain, Please try again");
    }
  }

  async onChainCreateNft(projectId: string, nft: NftEntity) {
    try {
      this.logger.log("Started creating contract for Project: " + projectId);
      await this.prepareTruffle();
      // always NFT creation is happening first time with IPX account address
      let nft1 = await this.lms.createNft(projectId,
          projectId, nft.color, nft.version, nft.model,
          nft.make, nft.engineNo, nft.chasisNo, nft.fcDate, nft.nftCategory, {from: this.account});
      this.logger.log(JSON.stringify(nft));
      this.logger.log("Completed creating contract for Project: " + projectId);
    } catch (e) {
      this.logger.error(e);
      if (this.configService.get("BLOCK_ON_FAILED_CHAIN_ACTIONS") !== "false")
        throw new RcxException("Error while creating NFT Project on BlockChain, Please try again");
    }
  }

  async onChainGetNftByProjectId(projectId: string) {
    try {
      this.logger.log("Started getting NFT Details for  Project: " + projectId);
      await this.prepareTruffle();
      let nft = await this.lms.getNftByProjectId(projectId, {from: this.account});
      this.logger.log(JSON.stringify(nft));
      this.logger.log("Completed getting NFT Details for  Project: " + projectId);
    } catch (e) {
      this.logger.error(e);
      if (this.configService.get("BLOCK_ON_FAILED_CHAIN_ACTIONS") !== "false") {
        throw new RcxException("Error while getting NFT Project details from BlockChain, Please try again");
      }
    }
  }

  async onChainTransferProjectNftOwnership(account: string, newOwner: string, projectId: string) {
    try {
      this.logger.log("Started NFT Project Ownership transfer request for projectId: " + projectId);
      await this.prepareTruffle();
      let nft = await this.lms.transferNftProjectOwnerShip(newOwner, projectId, {from: account});
      this.logger.log(JSON.stringify(nft));
      this.logger.log("Completed NFT Project Ownership transfer request for projectId: " + projectId);
    } catch (e) {
      this.logger.error(e);
      if (this.configService.get("BLOCK_ON_FAILED_CHAIN_ACTIONS") !== "false")
        throw new RcxException("Error while NFT Project Ownership transfer request on BlockChain, Please try again");
    }
  }

  async onChainPayout(value: string, address: string) {
    try {
      await this.prepareTruffle();
      const amountToSend = web3.utils.toWei(value, "ether");
      let nft = await this.lms.payout(address, {from: this.account, value: amountToSend});
      return nft;
    } catch (e) {
      this.logger.error(e);
      throw new RcxException("Error while doing payout, Please try again");
    }
  }
}
