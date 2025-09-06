import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: DatabaseService) { }
    private readonly logger: Logger = new Logger(TenantsService.name);


    addTenant = async (payload: Prisma.TenantCreateInput) => {
        try {
            if (!payload) {
                throw new BadRequestException("Invalid payload");
            }
            const tenant = await this.prisma.byPassRls().tenant.create({
                data: payload
            })
            return { success: true, tenant }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    updateTenantRecord = async (payload: Prisma.TenantUpdateInput, tenantId: string) => {
        try {
            const tenant = await this.prisma.byPassRls().tenant.findUnique({
                where: {
                    id: tenantId
                }
            })
            if (!tenant) {
                throw new NotFoundException("Tenant not found")
            }
            if (!payload) {
                throw new BadRequestException("Invalid payload");
            }
            const record = await this.prisma.byPassRls().tenant.update({
                where: {
                    id: tenantId
                },
                data: payload
            })
            return { success: true, tenant: record }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    getTenant = async (tenantId: string) => {
        try {
            const tenant = await this.prisma.byPassRls().tenant.findUnique({
                where: {
                    id: tenantId
                }
            });
            if (!tenant) {
                throw new NotFoundException("Tenant not found")
            }
            return { success: true, tenant }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    //paginate records
    getTenants = async () => {

    }
}



