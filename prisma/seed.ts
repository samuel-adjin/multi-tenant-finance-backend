import { PrismaClient } from "@prisma/client"
import { error } from "console";

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding Database...")
    //TODO: seed tenant, super admin and accounts

}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async () => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
})