import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { AppClsModule } from 'src/modules/app-cls/app-cls.module';

@Module({
  providers: [DatabaseService],
  imports:[AppClsModule],
  exports:[DatabaseService]
})
export class DatabaseModule {}
