import { Role } from "@prisma/client";

export interface IApplicationContext {
    role: Role,
    tenantId: string,
    userId:string,
}