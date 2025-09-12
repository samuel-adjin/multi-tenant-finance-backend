import { Injectable, NotAcceptableException, Scope } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IApplicationContext } from '../types/appl-context.type'
import { Role } from '@prisma/client';


@Injectable({ scope: Scope.REQUEST })
export class AppClsService {
    constructor(private readonly cls: ClsService) { }

    setApplicationContext(applicationContext: IApplicationContext) {
        if (!applicationContext) {
            throw new NotAcceptableException("ApplicationContext can not be null or empty")
        }

        if (!applicationContext.role.trim() || !applicationContext.tenantId.trim()) {
            throw new NotAcceptableException("Role or TenantId can not be null or empty")
        }

        this.cls.set("applicationContext", applicationContext);

    }

    getApplicationContext(): IApplicationContext {
        const context = this.cls.get<IApplicationContext>("applicationContext");
        if (!context) {
            throw new NotAcceptableException("Context not set")
        }
        return context;
    }

    isSuperAdmin() {
        return this.getApplicationContext().role === Role.SUPER_ADMIN;
    }

    hasRole(role: Role): boolean {
        return this.getApplicationContext().role === role;
    }

    getCurrentUserRole(): Role {
        return this.getApplicationContext().role
    }
    getCurrentUserId(): string {
        return this.getApplicationContext().userId;
    }

    getCurrentTenantId(): string {
        return this.getApplicationContext().tenantId;
    }
}
