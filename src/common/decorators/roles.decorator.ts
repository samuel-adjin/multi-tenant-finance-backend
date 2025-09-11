import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const roles = (...roles: Role[]) => {
    return SetMetadata("roles", roles)
}