import { Injectable, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { byPassExtension, tenantExtension } from '../extensions/tenant-extension';
import { AppClsService } from '../app-cls/app-cls.service';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(
        private readonly applCls: AppClsService
    ){
        super({
            errorFormat:'pretty',
        })
    }

    async onModuleInit() {
       this.$connect();
    }

    onModuleDestroy() {
        this.$disconnect()
    }

    
     withTenant() {
        const tenantId:string = this.applCls.getApplicationContext().tenantId;
        const role:string= this.applCls.getApplicationContext().role;
         return this.$extends(tenantExtension(tenantId, role));
    }

     byPassRls() {
        return this.$extends(byPassExtension());
    }
    
}
