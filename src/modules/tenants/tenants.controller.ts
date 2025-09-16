import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createTenantSchema, CreateTenantType, updateTenantSchema, UpdateTenantType } from './tenant.schema';
import { ParseCuidPipe } from '../../common/pipes/cuid-parse.pipe';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantService: TenantsService) { }

    @Post()
    @UsePipes(new ZodValidationPipe(createTenantSchema))
    async addTenant(@Body() payload: CreateTenantType) {
        return this.tenantService.addTenant(payload);
    }

    @Put(":tenantId")
    @UsePipes(new ZodValidationPipe(updateTenantSchema))
    async updateTenantRecord(@Body() payload: UpdateTenantType, @Param("tenantId", ParseCuidPipe) tenantId: string) {
        return this.tenantService.updateTenantRecord(payload, tenantId)
    }

    @Get(":tenantId")
    async getTenant(@Param("tenantId", ParseCuidPipe) tenantId: string) {
        return this.tenantService.getTenant(tenantId)
    }

    @Get()
    async getTenants(@Query() pageSize: number, @Query() page: number) {
        return this.tenantService.getTenants(pageSize, page);
    }

    @Delete(":tenantId")
    async deleteTenant(@Param("tenantId", ParseCuidPipe) tenantId: string) {
        return this.tenantService.deleteTenant(tenantId)
    }
}
