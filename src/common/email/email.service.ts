import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
    constructor(@InjectQueue('emailQueue') private readonly mailQueue: Queue) { }

    async sendEmail(emailData: {
        to: string;
        subject: string;
        template: string;
        context: Record<string, any>;
    }) {
        console.log("sending email...");
        await this.mailQueue.add('send-email', emailData, {
            attempts: 5,
            backoff: { type: "exponential", delay: 3000 }
        });
    }

}
