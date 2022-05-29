import {
  BeforeInsert,
  BeforeUpdate,
  Column, ObjectIdColumn,
} from "typeorm";
import {v4} from 'uuid';
import {ApiProperty} from "@nestjs/swagger";
import {cleanUpSecurityContextAndUValueFromEntity} from "./utils";

export class BaseEntity {

  @ObjectIdColumn()
  @ApiProperty()
  _id: string;

  @Column()
  @ApiProperty()
  public createdAt: Date;

  @Column()
  @ApiProperty()
  public updatedAt: Date;

  @Column({nullable: true})
  @ApiProperty()
  public createdBy: string;

  @Column({nullable: true})
  @ApiProperty()
  public updatedBy: string;

  @Column()
  @ApiProperty()
  public deleted: boolean;

  @BeforeInsert()
  async populateDetails(): Promise<void> {
    if (this._id === undefined || this._id === null || this._id.length < 30)
      this._id = v4();
    this.createdAt = new Date();
    this.deleted = false;
    cleanUpSecurityContextAndUValueFromEntity(this);
  }

  @BeforeUpdate()
  async populateUpdateDetails(): Promise<void> {
    this.updatedAt = new Date();
    cleanUpSecurityContextAndUValueFromEntity(this);
  }
}
