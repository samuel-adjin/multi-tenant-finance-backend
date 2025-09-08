import { QueueConfig } from "../../types/queue.types";

export const queueConfig:QueueConfig[] = [
    {
        name: 'emailQueue',
        defaultJobOptions: {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
        },
    }
]