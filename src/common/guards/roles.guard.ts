import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles: Role[] = this.reflector.getAllAndOverride("roles", [context.getHandler(), context.getClass()]);
        if (!roles || roles.length == 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new UnauthorizedException("User not found")
        }
        if (!user.role) {
            throw new UnauthorizedException("User role not found");
        }
        if (!user.role) {
            throw new UnauthorizedException(
                `Access denied. Required roles: ${roles.join(', ')}`
            );
        }
        return true;
    }

}