import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { DatabaseModule } from '../../../common/database/database.module';

@Module({
  providers: [UserAuthService],
  exports:[UserAuthService],
  imports:[DatabaseModule]
})
export class UserAuthModule {}
