import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWarmGreet() {
    return {
      status: 200,
      message: 'Warm Greeting from WFH Attendance Backend',
      timestamp: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta'
      })
    };
  }

  getHealthCheck() {
    return {
      status: 200,
      message: 'WFH Attendance Api healthy',
      timestamp: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta'
      })
    };
  }
}
