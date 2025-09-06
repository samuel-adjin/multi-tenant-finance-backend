import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { EmailPayload } from "../queue.types";
import { Job } from "bullmq";
import { MailerService } from "@nestjs-modules/mailer";

@Processor('emailQueue')
export class EmailProcessor extends WorkerHost {

    constructor(private readonly mailer: MailerService) {
        super();
    }


  async process(job: Job): Promise<void> {
    try {
      const { to, context, template, subject } = job.data;

      const mailOptions = {
        to,
        subject,
        template, 
        context, 
      };

      console.log('Sending email with options:', mailOptions);
      await this.mailer.sendMail(mailOptions);
      
      console.log(`Email successfully sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${job.data.to}:`, error.message);
      throw error;
    }
  }


    @OnWorkerEvent('completed')
    onCompleted(job: Job<EmailPayload, any, string>) {
        console.log(`Email sent to ${job.data.to} with job id: ${job.id} `)
    }
}