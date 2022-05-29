import {forwardRef, HttpModule, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {NftRepository} from "./repository/nft.repository";
import {AuthModule} from "../auth/auth.module";
import {NftController} from "./controller/nft.controller";
import {NftService} from "./service/nft.service";
import {UserService} from "../user/service/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([NftRepository]),
    forwardRef(() => AuthModule)
    , HttpModule],
  controllers: [NftController],
  providers: [NftService, UserService],
  exports: [NftService]
})
export class NftModule {
}
