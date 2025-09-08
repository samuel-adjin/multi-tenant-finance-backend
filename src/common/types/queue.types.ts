
export interface EmailPayload {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    from?: string;
    cc?: string[];
    bcc?: string[];
    priority?: 'low' | 'normal' | 'high';
    scheduledFor?: Date;
}

export interface QueueConfig {
    name: string;
    defaultJobOptions?: {
        removeOnComplete?: number;
        removeOnFail?: number;
        attempts?: number;
        backoff?: {
            type: 'fixed' | 'exponential';
            delay: number;
        };
    };
}