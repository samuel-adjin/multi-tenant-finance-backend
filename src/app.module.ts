import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppClsModule } from './common/app-cls/app-cls.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './common/queue/queue.module';
import { EmailModule } from './common/email/email.module';


@Module({
  imports: [DatabaseModule,TenantsModule, UsersModule,QueueModule, EmailModule, AuthModule, AppClsModule, ConfigModule.forRoot({
    isGlobal: true
  }), ],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
