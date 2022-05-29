import {EntityRepository, Repository} from "typeorm";
import {NftEntity} from "../entities/nft.entity";
import {SecurityContextService} from "../../auth/services/security-context.service";
import {
  getDatabaseConnectionManager
} from "../../common/utils";
import RcxException from "../../common/exception/rcx.exception";

@EntityRepository(NftEntity)
export class NftRepository extends Repository<NftEntity> {
  ERR_MSG: string = "Something went wrong, please try again";
  securityContextService: SecurityContextService;

  constructor(securityContextService: SecurityContextService) {
    super();
    this.securityContextService = securityContextService;
  }

  public async createNft(nftEntity: NftEntity) {
    try {
      return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).save(NftEntity, nftEntity);
    } catch (e) {
      throw new RcxException(this.ERR_MSG);
    }
  }

  public async updateNft(id: string, nftEntity: NftEntity) {
    try {
      return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).update(NftEntity, {_id: id}, nftEntity);
    } catch (e) {
      throw new RcxException(this.ERR_MSG);
    }
  }

  public async getInvestmentHistory(walletAddress: string) {
    try {
      return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).find(NftEntity, {owner: walletAddress});
    } catch (e) {
      throw new RcxException(this.ERR_MSG);
    }
  }

  public async getAllNftByCategory(category: string) {
    try {
      if (category !== undefined)
        return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).find(NftEntity,
            {
              where: {nftCategory: category}
            });
      else
        return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).find(NftEntity);
    } catch (e) {
      throw new RcxException(this.ERR_MSG);
    }
  }

  public async getNftById(id: string) {
    let nft: NftEntity = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(NftEntity, {_id: id});
    if (nft == null) {
      throw new RcxException("No NFT found with id: " + id);
    }
    return nft;
  }
}
