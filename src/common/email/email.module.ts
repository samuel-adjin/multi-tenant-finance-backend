import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { QueueModule } from '../queue/queue.module';


@Module({
  providers: [EmailService],
  exports: [EmailService, MailerModule],
  imports: [QueueModule, MailerModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      transport: {
        host: config.get<string>('MAIL_HOST') ?? "sandbox.smtp.mailtrap.io",
        port: config.get<number>('MAIL_PORT') ?? 2525, // Changed from 587 to 2525 for Mailtrap
        secure: config.get<boolean>('MAIL_SECURE') ?? false,
        auth: {
          user: config.get<string>('MAIL_USERNAME'),
          pass: config.get<string>('MAIL_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `"Financial " <${config.get<string>('MAIL_FROM') ?? 'no-reply@hopin.com'}>`,
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
    }),
    inject: [ConfigService],
  }),]
})
export class EmailModule { }
