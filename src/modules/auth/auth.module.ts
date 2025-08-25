import { Module } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MagicLinkLoginStrategy } from './user-auth/strategy/magic-link.strategy';

@Module({
  imports: [UserAuthModule, CustomerAuthModule,JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('SECRET'),
    }),
    inject: [ConfigService],
  }),],
  providers:[MagicLinkLoginStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
