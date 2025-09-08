import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { BulkJobOptions, Queue } from 'bullmq';
import { EmailPayload } from '../types/queue.types';

@Injectable()
export class EmailService {
    constructor(@InjectQueue('emailQueue') private readonly mailQueue: Queue) { }

    async sendEmail(emailData: EmailPayload) {
        await this.mailQueue.add('send-email', emailData);
    }

    async sendBulkEmail(emailData: EmailPayload[]) {
        const opts: BulkJobOptions = {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        }
        const jobs = emailData.map((emailData) => ({
            name: "send-bulk-email",
            data: emailData,
            opts
        }))
        await this.mailQueue.addBulk(jobs)
    }

}
