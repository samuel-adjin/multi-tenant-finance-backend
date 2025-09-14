import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { EmailModule } from '../../../common/email/email.module';


@Module({
  providers: [UserAuthService],
  exports: [UserAuthService],
  imports: [EmailModule],
})
export class UserAuthModule { }
