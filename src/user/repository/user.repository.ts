import {EntityRepository, Repository} from "typeorm";
import {User} from "../entities/user.entity";
import {
  cleanUpSecurityContextAndUValueFromEntity,
  getDatabaseConnectionManager
} from "../../common/utils";
import IpxException from "../../common/exception/ipx.exception";
import {SecurityContextService} from "../../auth/services/security-context.service";
import {MetamaskDetails} from "../dto/metamask-details";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  ERR_MSG: string = "Something went wrong, please try again";
  securityContextService: SecurityContextService;

  constructor(securityContextService: SecurityContextService) {
    super();
    this.securityContextService = securityContextService;
  }

  public getUserByEmail(email: string) {
    return getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {email: email});
  }

  public async saveEntity(user: User) {
    try {
      cleanUpSecurityContextAndUValueFromEntity(user);
      if (user.metaMaskDetails != null && user.metaMaskDetails.walletAddress != null) {
        let exist = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User,
            {
              where: {"metaMaskDetails.walletAddress": user.metaMaskDetails.walletAddress}
            });
        if (!exist)
          return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).save(User, user);
      } else {
        let exist = await this.isUserDetailsExistWithEmailOrPh(user.email, user.phone);
        if (!exist)
          return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).save(User, user);
      }
    } catch (e) {
      throw new IpxException(this.ERR_MSG);
    }
    throw new IpxException("Email / Phone number / Public Address already exists");
  }

  public async getAllEntity() {
    try {
      return await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).find(User);
    } catch (e) {
      throw new IpxException(this.ERR_MSG);
    }
  }

  public async getEntityByWalletAddress(address: string) {
    try {
      let user = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {
        where: {
          "metaMaskDetails": {$exists: true, $ne: null},
          "metaMaskDetails.walletAddress": {$exists: true, $eq: address},
        }
      });
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  public async getEntity(id: string) {
    let user = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {_id: id});
    if (user == null) {
      throw new IpxException("No user found with id: " + id);
    }
    return user;
  }

  public async getEntityByEmail(email: string) {
    let user = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {email: email});
    if (user == null) {
      throw new IpxException("No user found with email: " + email);
    }
    return user;
  }

  public async getEntityByPhone(phone: string) {
    let user = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {phone: phone});
    if (user == null) {
      throw new IpxException("No user found with phone: " + phone);
    }
    return user;
  }

  public async updateEntity(id: string, user: User) {
    let existingUser = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {_id: id});
    if (existingUser == null) {
      throw new IpxException("Update user failed: No user found with id: " + id);
    }

    if (user.metaMaskDetails !== undefined && user.metaMaskDetails.walletAddress !== undefined) {
      let ex = await this.getEntityByWalletAddress(user.metaMaskDetails.walletAddress);
      if (ex !== undefined && ex._id !== id)
        throw new IpxException("Found another User linked this wallet address to IPX: " + user.metaMaskDetails.walletAddress);
    }
    this.prepareUserUpdateData(existingUser, user);
    await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).update(User, {_id: id}, existingUser);
    return existingUser;
  }

  private prepareUserUpdateData(existingUserData, currentUserData) {
    if (existingUserData !== null && currentUserData !== null) {
      if (currentUserData.password)
        existingUserData.password = existingUserData.password !== currentUserData.password ? currentUserData.password : existingUserData.password;
      if (currentUserData.forcePasswordChange !== existingUserData.forcePasswordChange)
        existingUserData.forcePasswordChange = currentUserData.forcePasswordChange;
      if (currentUserData.firstName !== existingUserData.firstName)
        existingUserData.firstName = currentUserData.firstName;
      if (currentUserData.lastName !== existingUserData.lastName)
        existingUserData.lastName = currentUserData.lastName;
      if (currentUserData.lastName !== existingUserData.lastName)
        existingUserData.lastName = currentUserData.lastName;
      if (currentUserData.profilePhotoUrl !== existingUserData.profilePhotoUrl)
        existingUserData.profilePhotoUrl = currentUserData.profilePhotoUrl;
      existingUserData.phoneVerified = currentUserData.phoneVerified ? currentUserData.phoneVerified : existingUserData.phoneVerified;
      existingUserData.emailVerified = currentUserData.emailVerified ? currentUserData.emailVerified : existingUserData.emailVerified;
      existingUserData.phoneOtp = existingUserData.phoneVerified ? null : existingUserData.phoneOtp;
      existingUserData.emailOtp = existingUserData.emailVerified ? null : existingUserData.emailOtp;
      if (currentUserData.metaMaskDetails != null) {
        if (existingUserData.metaMaskDetails === undefined || existingUserData.metaMaskDetails === null)
          existingUserData.metaMaskDetails = new MetamaskDetails();
        existingUserData.metaMaskDetails.walletAddress = currentUserData.metaMaskDetails.walletAddress ? currentUserData.metaMaskDetails.walletAddress : existingUserData.metaMaskDetails.walletAddress;
        existingUserData.metaMaskDetails.nonce = currentUserData.metaMaskDetails.nonce ? currentUserData.metaMaskDetails.nonce : existingUserData.metaMaskDetails.nonce;
      }
    }
  }

  public async updatePassword(existingUser: User) {
    existingUser.forcePasswordChange = false;
    existingUser.password = await existingUser.getEncryptedPassword(existingUser.password);
    await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).update(User, {_id: existingUser._id}, existingUser);
    return existingUser;
  }

  public async removeEntity(id: string) {
    let existingUser = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {_id: id});
    if (existingUser == null) {
      throw new IpxException("Delete user failed: No user found with id: " + id);
    }
    existingUser.deleted = true;
    return getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).save(User, existingUser);
  }

  async isUserDetailsExistWithEmailOrPh(email: string, phone: string) {
    let userWithEmail: User = null;
    let userWithPhone: User = null;
    if (email !== undefined) {
      userWithEmail = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {email: email});
    }
    if (phone !== undefined) {
      userWithPhone = await getDatabaseConnectionManager(this.securityContextService.getTenantDetails()).findOne(User, {phone: phone});
    }
    return (userWithEmail != null || userWithPhone != null)
  }
}
