import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { QueueModule } from '../queue/queue.module';
import { EmailProcessor } from '../queue/processors/email.processor';


@Module({
  providers: [EmailService,EmailProcessor],
  exports: [EmailService, MailerModule],
  imports: [QueueModule, MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => {
      const isProduction = config.get<string>('NODE_ENV') === 'production';

      return {
        transport: {
          host: config.get<string>('MAIL_HOST', '"sandbox.smtp.mailtrap.io"'),
          port: config.get<number>('MAIL_PORT', 2525), // Changed from 587 to 2525 for Mailtrap
          secure: isProduction,
          auth: {
            user: config.get<string>('MAIL_USERNAME'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: isProduction,
          },
          // Production-specific settings
          pool: isProduction,
          maxConnections: isProduction ? 5 : 1,
          maxMessages: isProduction ? 100 : 1,
          rateDelta: 1000,
          rateLimit: 1,
        },
        defaults: {
          from: `"Financial " <${config.get<string>('MAIL_FROM','no-reply@aa-group.com') }>`,
        },
        template: {
          dir: join(process.cwd(), 'src', 'common', 'email', 'templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }
    },
    inject: [ConfigService],
  }),]
})
export class EmailModule { }
