import { Module, Scope } from '@nestjs/common';
import { UserAuthModule } from './user-auth/user-auth.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { MagicLinkLoginStrategy } from '../../common/strategies/magic-link.strategy';
import { UserAuthService } from './user-auth/user-auth.service';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { EmailService } from '../../common/email/email.service';
import { EmailModule } from '../../common/email/email.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AppClsInterceptor } from '../../common/interceptors/app-cls.interceptor';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UserAuthModule, UsersModule, EmailModule, CustomerAuthModule, JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
    }),
    inject: [ConfigService],
  }),],
  providers: [
    {
      provide: MagicLinkLoginStrategy,
      useFactory: (userService: UsersService, configService: ConfigService, emailService: EmailService) => {
        return new MagicLinkLoginStrategy(userService, configService, emailService);
      },
      inject: [UserAuthService, ConfigService, EmailService],
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppClsInterceptor,
      scope: Scope.REQUEST
    },
    AuthService,

  ],
  controllers: [AuthController],
})
export class AuthModule { }
