import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AppClsService } from "../app-cls/app-cls.service";
import { IApplicationContext } from "../types/appl-context.type";
import { SKIP_INTERCEPTOR_KEY } from "../decorators/skipInterceptor.decorator";
import { Reflector } from "@nestjs/core";


@Injectable()
export class AppClsInterceptor implements NestInterceptor {
    constructor(private readonly appCls: AppClsService,private readonly reflector: Reflector) { 
    }
    
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const skip: boolean = this.reflector.getAllAndOverride<boolean>(
            SKIP_INTERCEPTOR_KEY,
            [context.getHandler(), context.getClass()]
        );
        if (skip) {
             return next.handle(); 
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new UnauthorizedException();
        }

        const appClsContext: IApplicationContext = {
            tenantId: user.tenantId || "",
            role: user.role || "",
            userId: user.id || ""

        }
        this.appCls.setApplicationContext(appClsContext);

        return next.handle()
    }

}