import { Prisma } from "@prisma/client";

export const tenantExtension = (tenantId: string, role: string) => {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            return await client.$transaction(async (tx) => {
              if (role === "SUPER_ADMIN") {
                await tx.$executeRawUnsafe(`SET LOCAL app.is_super = 'true'`);
              } else if (tenantId) {
                await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
              }
              const txModel = (tx as any)[model];
              
              if (!txModel || typeof txModel[operation] !== 'function') {
                throw new Error(`Operation ${operation} not found on model ${model}`);
              }

              return await txModel[operation](args);
            });
          },
        },
      },
    });
  });
};

export const byPassExtension = () => {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            return await client.$transaction(async (tx) => {
              await tx.$executeRawUnsafe(`SET LOCAL app.is_super = 'true'`);
              
              const txModel = (tx as any)[model];
              
              if (!txModel || typeof txModel[operation] !== 'function') {
                throw new Error(`Operation ${operation} not found on model ${model}`);
              }

              return await txModel[operation](args);
            });
          },
        },
      },
    });
  });
};