import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { DatabaseModule } from '../../common/database/database.module';
import { TenantsController } from './tenants.controller';

@Module({
  providers: [TenantsService],
  imports:[DatabaseModule],
  controllers: [TenantsController]
})
export class TenantsModule {}
