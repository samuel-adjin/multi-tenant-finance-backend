import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppClsModule } from './modules/app-cls/app-cls.module';
import { ConfigModule } from '@nestjs/config';
import { SeedsService } from './common/seeds/seeds.service';


@Module({
  imports: [DatabaseModule, TenantsModule, UsersModule, AuthModule, AppClsModule, ConfigModule.forRoot({
    isGlobal: true
  }), ],
  controllers: [AppController],
  providers: [AppService,SeedsService],
})
export class AppModule { }
