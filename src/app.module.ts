import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { AppClsModule } from './common/app-cls/app-cls.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';


@Module({
  imports: [DatabaseModule, AppClsModule, AuthModule, UsersModule, ConfigModule.forRoot({
    isGlobal: true
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
