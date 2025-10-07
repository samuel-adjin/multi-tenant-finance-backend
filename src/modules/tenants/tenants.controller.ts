import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateTenantUserType, TenantType, createTenantUserSchema, tenantSchema } from './tenant.schema';
import { ParseCuidPipe } from '../../common/pipes/cuid-parse.pipe';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantService: TenantsService) { }

    @Post()
    @UsePipes(new ZodValidationPipe(tenantSchema))
    async addTenant(@Body() payload: TenantType) {
        return this.tenantService.addTenant(payload);
    }

    @Post("/user")
    @UsePipes(new ZodValidationPipe(createTenantUserSchema))
    async addTenantUSer(@Body() payload: CreateTenantUserType) {
        return this.tenantService.addTenantUser(payload);
    }

    @Put(":tenantId")
    async updateTenantRecord(@Param("tenantId", ParseCuidPipe) tenantId: string, @Body(new ZodValidationPipe(tenantSchema)) payload: TenantType) {
        return this.tenantService.updateTenantRecord(payload, tenantId)
    }

    @Get(":tenantId")
    async getTenant(@Param("tenantId", ParseCuidPipe) tenantId: string) {
        return this.tenantService.getTenant(tenantId)
    }

    @Get("")
    async getTenants(@Query("pageSize") pageSize: number, @Query("page") page: number) {
        return this.tenantService.getTenants(pageSize, page);
    }

    @Delete(":tenantId")
    async deleteTenant(@Param("tenantId", ParseCuidPipe) tenantId: string) {
        return this.tenantService.deleteTenant(tenantId)
    }
}
