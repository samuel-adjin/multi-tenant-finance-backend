import { Prisma } from "@prisma/client";



export const tenantExtension = (tenantId: string, role: string) => {
    return Prisma.defineExtension((client) => {
        return client.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        await client.$transaction(async (tx) => {
                            if (role === "SUPER_ADMIN") {
                                await tx.$executeRaw`SELECT set_config('app.is_super', 'true', TRUE)`;
                            } else if (tenantId) {
                                const id = Prisma.sql`${tenantId}`
                                await tx.$executeRaw`SELECT set_config('app.current_tenant_id',${id} , TRUE)`;
                            }
                            return await query(args);
                        })
                    },
                },
            },
        })
    })
}

export const byPassExtension = () => {
    return Prisma.defineExtension((client) => {
        return client.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        await client.$transaction(async (tx) => {
                            await tx.$executeRaw`SELECT set_config('app.is_super', 'true', TRUE)`;
                            return await query(args);
                        })
                    },
                },
            },
        })
    })
}


