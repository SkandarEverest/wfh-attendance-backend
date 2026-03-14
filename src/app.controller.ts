import { Controller, Get } from '@nestjs/common';
import { AppService } from '@/app.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  greeting() {
    return this.appService.getWarmGreet();
  }

  @Public()
  @Get('health-check')
  healthCheck() {
    return this.appService.getHealthCheck();
  }
}
