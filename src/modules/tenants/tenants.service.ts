import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CreateTenantUserType, TenantType } from './tenant.schema';

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: DatabaseService) { }
    private readonly logger: Logger = new Logger(TenantsService.name);


    addTenant = async (payload: TenantType) => {
        try {
            if (!payload) {
                throw new BadRequestException("Invalid payload");
            }
            const foundTenant = await this.prisma.byPassRls().tenant.findFirst({
                where: {
                    OR: [
                        {
                            email: {
                                contains: payload.email,
                                mode: "insensitive"
                            },
                            mobile: {
                                contains: payload.mobile,
                                mode: "insensitive"
                            },
                            slug: {
                                contains: payload.slug,
                                mode: "insensitive"
                            }
                        }
                    ],
                }
            });
            if (foundTenant) {
                throw new ConflictException("User exists")
            }
            const tenant = await this.prisma.byPassRls().tenant.create({
                data: payload
            },
            )
            return { success: true, tenant }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occurred ${err.message}`);
            throw error;
        }
    }

    updateTenantRecord = async (payload: TenantType, tenantId: string) => {
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
            throw error;
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
            throw error;
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
            const hasNextPage = page < totalPages
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
            throw error;
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
            throw error;
        }
    }

    addTenantUser = async (payload: CreateTenantUserType) => {
        try {
            if (!payload || !payload.tenant || !payload.user) {
                throw new BadRequestException("Invalid payload");
            }
            const tenant = payload.tenant
            const user = payload.user

            const foundTenant = await this.prisma.byPassRls().tenant.findFirst({
                where: {
                    OR: [
                        {
                            email: {
                                contains: tenant.email,
                                mode: "insensitive"
                            },
                            mobile: {
                                contains: tenant.mobile,
                                mode: "insensitive"
                            },
                            slug: {
                                contains: tenant.slug,
                                mode: "insensitive"
                            }
                        }
                    ],
                }
            });
            if (foundTenant) {
                throw new ConflictException("User exists")
            }
            const tenantUser = await this.prisma.byPassRls().tenant.create({
                data: {
                    ...tenant,
                    User: {
                        create: {
                            ...user,
                            role: "ADMIN",
                            isVerified: true,
                            dob: new Date(),
                            isActive: true,
                        }
                    }
                },

            },

            )
            return { success: true, tenantUser }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occurred ${err.message}`);
            throw error;
        }
    }
}



