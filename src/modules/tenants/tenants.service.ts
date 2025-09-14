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


    getTenants = async (pageSize: number = 10, page: number = 1) => {
        try {
            pageSize = Math.max(pageSize, 1);
            page = Math.max(page, 1);
            const skip = (page - 1) * pageSize;
            const totalCount = await this.prisma.withTenant().tenant.count();
            const totalPages = Math.ceil(totalCount / pageSize) || 1;
            const tenants = await this.prisma.withTenant().tenant.findMany({
                orderBy: {
                    createdAt: 'asc'
                },
                skip,
                take: pageSize
            })
            const hasNextPage = page < totalCount
            const hasPreviousPage = page > 1
            return {
                success: true, items: tenants,
                pagination: {
                    currentPage: page,
                    pageSize,
                    totalCount,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage,
                }
            }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    deleteTenant = async (tenantId: string) => {
        try {
            const tenant = await this.prisma.withTenant().tenant.findUnique({
                where: {
                    id: tenantId
                }
            })
            if (!tenant) {
                throw new NotFoundException("Tenant does not exist ")
            }
            await this.prisma.withTenant().tenant.delete({
                where: {
                    id: tenantId
                }
            })
            return { success: true, message: "Tenant deleted successfully" }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }
}



