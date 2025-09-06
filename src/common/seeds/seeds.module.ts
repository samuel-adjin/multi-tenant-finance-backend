import { Module } from '@nestjs/common';
import { AppClsModule } from '../../modules/app-cls/app-cls.module';
import { DatabaseModule } from '../database/database.module';
import { SeedsService } from './seeds.service';

@Module({
    imports:[AppClsModule, DatabaseModule],
    providers:[SeedsService]
})
export class SeedsModule {}
