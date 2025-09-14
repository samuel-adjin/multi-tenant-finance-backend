import { PrismaClient } from '@prisma/client';
import { SUPER_TENANT } from './tenant';

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.is_super', 'true', TRUE)`;
            const tenants = await tx.tenant.findMany();
            if (tenants.length === 0) {
                await tx.tenant.create({ data: SUPER_TENANT });
                console.log('Inserted SUPER_TENANT');
            } else {
                console.log('Tenants already exist');
            }
        });
    } catch (error) {
        console.error('Error setting up Db setup:', error);
        throw error;
    }
}

main()
    .then(async () => {
        console.log('\n Db seeding finished');
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error('\n Db setup failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    });