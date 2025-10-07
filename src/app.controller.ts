import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { Roles } from './common/decorators/roles.decorator';
import { SkipInterceptor } from './common/decorators/skipInterceptor.decorator';

@Controller()
@Roles()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Public()
  @SkipInterceptor()
  @Get()
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
