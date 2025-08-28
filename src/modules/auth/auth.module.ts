import { Module } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MagicLinkLoginStrategy } from '../../common/strategies/magic-link.strategy';
import { UserAuthService } from './user-auth/user-auth.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [UserAuthModule, CustomerAuthModule, JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET '),
    }),
    inject: [ConfigService],
  }),],
  providers: [
    {
      provide: MagicLinkLoginStrategy,
      useFactory: (userAuthService: UserAuthService, configService: ConfigService) => {
        return new MagicLinkLoginStrategy(userAuthService, configService);
      },
      inject: [UserAuthService, ConfigService],
    },
    {
      provide: JwtStrategy,
      useFactory: (configService: ConfigService) => {
        return new JwtStrategy(configService);
      },
      inject: [ConfigService],
    },
    {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
    AuthService,

  ],
  controllers: [AuthController],
})
export class AuthModule { }
