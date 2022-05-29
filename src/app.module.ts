import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import {ormconfig} from "ormconfig";
import {ScheduleModule} from "@nestjs/schedule";
import {UserModule} from "./user/user.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(ormconfig[0]),
    UserModule,
    ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
