import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IApplicationContext } from '../types/appl-context.type'


@Injectable()
export class AppClsService {
    constructor(private readonly cls: ClsService) { }

    setApplicationContext(applicationContext:IApplicationContext) {
        if (!applicationContext) {
            throw new NotAcceptableException("ApplicationContext can not be null or empty")
        }

        if(!applicationContext.role.trim() || !applicationContext.tenantId.trim()){
             throw new NotAcceptableException("Role or TenantId can not be null or empty")
        }

        this.cls.set("applicationContext", applicationContext);
      
    }

    getApplicationContext():IApplicationContext {
       const context = this.cls.get<IApplicationContext>("applicationContext");
       if(!context){
        throw new NotAcceptableException("Context not set")
       }
       return context;  
    }

    isSuperAdmin(){
        return this.getApplicationContext().role === "SUPER_ADMIN";
    }
}
