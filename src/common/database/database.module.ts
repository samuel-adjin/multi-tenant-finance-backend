import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { AppClsModule } from '../app-cls/app-cls.module';

@Global()
@Module({
  providers: [DatabaseService],
  imports:[AppClsModule],
  exports:[DatabaseService]
})
export class DatabaseModule {}
