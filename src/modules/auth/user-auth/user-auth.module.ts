import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { DatabaseModule } from '../../../common/database/database.module';
import { AppClsModule } from '../../app-cls/app-cls.module';

@Module({
  providers: [UserAuthService],
  exports:[UserAuthService],
  imports:[DatabaseModule, AppClsModule],
})
export class UserAuthModule {}
