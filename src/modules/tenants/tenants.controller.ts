import { Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Prisma } from '@prisma/client';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantService: TenantsService) { }

    @Post()
    async addTenant(payload: Prisma.TenantCreateInput) {
        return this.tenantService.addTenant(payload);
    }

    @Put(":tenantId")
    async updateTenantRecord(payload: Prisma.TenantUpdateInput, @Param("tenantId") tenantId: string) {
        return this.tenantService.updateTenantRecord(payload, tenantId)
    }

    @Get(":tenantId")
    async getTenant(@Param("tenantId") tenantId: string) {
        return this.tenantService.getTenant(tenantId)
    }

    @Get()
    async getTenants(@Query() query: { pageSize: number, page: number }) {
        return this.tenantService.getTenants(query.pageSize, query.page);
    }
}
