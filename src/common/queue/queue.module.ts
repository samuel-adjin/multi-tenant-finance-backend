import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { queueConfig } from './config/queue.config';

@Global()
@Module({
  providers: [QueueService],
  exports: [BullModule, QueueService],
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          // Production Redis settings
          connectTimeout: 10000,
          lazyConnect: true,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxLoadingTimeout: 5000
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      }),
      inject: [ConfigService],
    }),
    ...queueConfig.map((config) => BullModule.registerQueue(config)),
  ],
})
export class QueueModule { }
