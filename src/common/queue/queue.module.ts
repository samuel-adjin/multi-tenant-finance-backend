import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { queueConfig } from './config/queue.config';

@Module({
  providers: [QueueService],
  exports: [BullModule],
  imports: [
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    ...queueConfig.map((config) => BullModule.registerQueue(config)),
  ],
})
export class QueueModule { }
