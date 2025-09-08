import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { EmailPayload } from "../../types/queue.types";
import { Job } from "bullmq";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { Logger } from "@nestjs/common";

@Processor('emailQueue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  constructor(private readonly mailer: MailerService) {
    super();
  }


  async process(job: Job): Promise<void> {
    const startTime = Date.now();
    try {
      this.validateEmailData(job.data)
      const { to, subject, template, context, cc, bcc } = job.data;

      const mailOptions: ISendMailOptions = {
        to,
        subject,
        template,
        context,
        cc,
        bcc,
      };

      const processingTime = Date.now() - startTime;
      this.logger.log({
        message: `Email sent successfully to ${job.data.to}`,
        jobId: job.id,
        processingTime,
        queue: 'emailQueue',
        event: 'job_completed'
      });
      await this.mailer.sendMail(mailOptions);

      this.logger.log(`Email successfully sent to ${to}`);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error({
        message: `Failed to send email to ${job.data.to}: ${error.message}`,
        jobId: job.id,
        processingTime,
        queue: 'emailQueue',
        event: 'job_failed',
        error: error.stack
      });
      throw error;
    }
  }


  @OnWorkerEvent('completed')
  onCompleted(job: Job<EmailPayload, any, string>) {
    this.logger.log(`Email sent to (Recipients: ${Array.isArray(job.data.to) ? job.data.to.join(', ') : job.data.to}) with job id: ${job.id}`);

  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmailPayload>, error: Error) {
    this.logger.error(`Email job failed: ${job.id} - ${error.message}`, {
      jobId: job.id,
      recipients: job.data.to,
      template: job.data.template,
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts,
      error: error.message,
    });
  }

  private mapPriorityToMailer(priority?: string): string {
    switch (priority) {
      case 'high': return 'high';
      case 'low': return 'low';
      default: return 'normal';
    }
  }


  private validateEmailData(data: EmailPayload): void {
    if (!data.to || (Array.isArray(data.to) && data.to.length === 0)) {
      throw new Error('Email recipients are required');
    }

    if (!data.subject?.trim()) {
      throw new Error('Email subject is required');
    }

    if (!data.template?.trim()) {
      throw new Error('Email template is required');
    }

    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  }
}