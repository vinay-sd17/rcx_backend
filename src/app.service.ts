import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
  getHeartbeat() {
    let response = {
      "message": "RCX API Service!",
      "timeStamp": new Date()
    };
    return response;
  }
}
