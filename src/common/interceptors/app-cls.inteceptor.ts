import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AppClsService } from "../app-cls/app-cls.service";
import { IApplicationContext } from "../types/appl-context.type";


@Injectable()
export class AppClsInterceptor implements NestInterceptor {
    constructor(private readonly appCls: AppClsService) { }
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new UnauthorizedException();
        }

        const appClsContext: IApplicationContext = {
            tenantId: user.tenantId || "",
            role: user.role || "",
            userId: user.userId || ""

        }
        this.appCls.setApplicationContext(appClsContext);

        return next.handle()
    }

}