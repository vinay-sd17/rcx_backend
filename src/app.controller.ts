import {Controller, Get, Res} from '@nestjs/common';
import {AppService} from './app.service';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import * as path from "path";

@Controller()
@ApiTags("API Health")
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('favicon.ico')
  @ApiOperation({summary: 'Endpoint used for heartbeat verification'})
  getFavIcon(@Res() res): string {
    let resolve = path.resolve('./favicon.ico');
    return res.send(resolve);
  }

  @Get()
  @ApiOperation({summary: 'Endpoint used for heartbeat verification'})
  getServiceHeartBeat() {
    return this.appService.getHeartbeat();
  }

  @Get('api')
  @ApiOperation({summary: 'Endpoint used for heartbeat verification'})
  getApiServiceHeartBeat() {
    return this.appService.getHeartbeat();
  }

  @Get('_ah/health')
  @ApiOperation({summary: 'Endpoint used for API health verification'})
  getServiceHeartBeatForGCP() {
    return this.appService.getHeartbeat();
  }
}
