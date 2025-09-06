import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SUPER_TENANT } from './tenant';

@Injectable()
export class SeedsService {
    private readonly logger: Logger = new Logger(SeedsService.name);
    constructor(private readonly prisma: DatabaseService) { }

    seedData = async () => {
        try {
            const tenants = await this.prisma.byPassRls().tenant.findMany({});
            if (tenants.length == 0) {
                await this.prisma.byPassRls().tenant.create({
                    data: SUPER_TENANT
                })
            }
            this.logger.log("Data already seeded")
        } catch (error) {
            const err = error as Error;
            throw new InternalServerErrorException("Error Seeding tenant and user data", err.message)
        }
    }
}
