import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AppClsModule } from './common/app-cls/app-cls.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';


@Module({
  imports: [DatabaseModule, AppClsModule, AuthModule, UsersModule, TenantsModule, ConfigModule.forRoot({
    isGlobal: true
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
