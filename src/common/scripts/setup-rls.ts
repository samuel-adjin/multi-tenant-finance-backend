import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
    try {
        const sqlPath = join(__dirname, '../prisma/sql/setup-rls.sql');
        if (existsSync(sqlPath)) {
            throw new NotFoundException("Path does not exist")
        }
        const rlsSQL = readFileSync(
            sqlPath,
            'utf-8'
        );
        if (!rlsSQL.trim()) {
            throw new InternalServerErrorException("Sql script is empty")
        }
        await prisma.$executeRawUnsafe(rlsSQL);
    } catch (error) {
        console.error(error)
    }

}

main().then(async () => {
    await prisma.$disconnect()
}).catch(async () => {
    console.error(error)
    await prisma.$disconnect();
    process.exit(1);
})