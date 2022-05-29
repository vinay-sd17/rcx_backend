import {BaseEntity} from "src/common/base.entity";
import {BeforeInsert, Column, Entity, Index} from "typeorm";
import {UserType} from "../enum/user-type";
import {MetamaskDetails} from "../dto/metamask-details";

const bcrypt = require('bcrypt');

@Entity({name: "users"})
export class User extends BaseEntity {

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
      // @Index({unique: true})
  email: string;

  @Column()
      // @Index({unique: true})
  profilePhotoUrl: string;

  @Column({nullable: true})
  password: string;

  @Column()
      // @Index({unique: true})
  phone: string;

  @Column()
  emailVerified: boolean;

  @Column()
  phoneVerified: boolean;

  @Column()
  forcePasswordChange: boolean;

  @Column()
  phoneOtp: number;

  @Column()
  emailOtp: number;

  @Column()
  userType: UserType;

  @Column()
  metaMaskDetails: MetamaskDetails;

  @BeforeInsert()
  async beforeInsertIntoDb() {
    if (this.metaMaskDetails === null || this.metaMaskDetails === undefined) {
      this.email = this.email.toLowerCase();
      this.password = this.password ? await this.getEncryptedPassword(this.password) : this.password;
      this.phoneOtp = Math.floor(100000 + Math.random() * 900000);
      this.emailOtp = Math.floor(100000 + Math.random() * 900000);
      this.emailVerified = false;
      this.phoneVerified = false;
      this.forcePasswordChange = false;
    } else {
      this.metaMaskDetails.nonce = Math.floor(Math.random() * 1000000);
    }
    this.userType = UserType.USER;
  }

  async getEncryptedPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }
}
