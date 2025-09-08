import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
    private readonly logger: Logger = new Logger(QueueService.name);
    private readonly queues: Map<string, Queue> = new Map();
    constructor(@InjectQueue("emailQueue") private readonly emailQueue: Queue) {
        this.queues.set("email", this.emailQueue)
    }


    getQueueStats = async (queueName: string) => {

        try {
            const queue = this.getQueue(queueName);
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                queue?.getWaitingCount(),
                queue?.getActiveCount(),
                queue?.getCompletedCount(),
                queue?.getFailedCount(),
                queue?.getDelayedCount(),
            ]);
            return {
                queueStats: { waiting, active, completed, failed, delayed }
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    private readonly getQueue = (queueName: string) => {
        if (!this.queues.get(queueName)) {
            throw new Error(`Queue ${queueName} does not exist`)
        }
        return this.queues.get(queueName);
    }
}
