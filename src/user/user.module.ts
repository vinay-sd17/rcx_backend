import {forwardRef, HttpModule, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserRepository} from "./repository/user.repository";
import {UserService} from "./service/user.service";
import {UserController} from "./controller/user.controller";
import {AuthModule} from "../auth/auth.module";
import {MetamaskController} from "./controller/metamask.controller";
import {AuthController} from "./controller/auth.controller";
import {FileProcessorController} from "./controller/file-processor.controller";
import {FileService} from "./service/file.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]),
    forwardRef(() => AuthModule)
    , HttpModule],
  controllers: [UserController, AuthController, MetamaskController,FileProcessorController],
  providers: [UserService, FileService],
  exports: [UserService]
})
export class UserModule {
}
