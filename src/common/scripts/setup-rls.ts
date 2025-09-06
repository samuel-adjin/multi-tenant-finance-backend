import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
    try {
        const sqlPath = join(process.cwd(), 'prisma/sql/setup-rls.sql');
        
        console.log(`Looking for SQL file at: ${sqlPath}`);
        
        // Fixed: Check if file does NOT exist
        if (!existsSync(sqlPath)) {
            throw new Error(`SQL file not found at path: ${sqlPath}`);
        }
        
        const rlsSQL = readFileSync(sqlPath, 'utf-8');
        
        if (!rlsSQL.trim()) {
            throw new Error("SQL script is empty");
        }
        
        console.log('Checking if RLS is already enabled...');
        
        // Check for specific policies that indicate RLS is set up
        const existingPolicies = await prisma.$queryRaw<Array<{policy_name: string, table_name: string}>>`
            SELECT 
                policyname as policy_name,
                tablename as table_name
            FROM pg_policies 
            WHERE schemaname = 'public'
            AND policyname IN ('user_tenant_isolation') -- Add all your policy names here
        `;
        
        if (existingPolicies.length > 0) {
            console.log(`Found ${existingPolicies.length} existing RLS policies:`);
            existingPolicies.forEach(policy => console.log(`  ✓ ${policy.policy_name} on ${policy.table_name}`));
            console.log('RLS already configured, skipping setup');
            return;
        }
        
        console.log('RLS policies not found, setting up Row Level Security...');
        
        // More robust SQL statement splitting
        const statements = rlsSQL
            .split(/;\s*(?:\r?\n|$)/) // Split on semicolon followed by whitespace and newline/end
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--')); // Remove empty lines and comments
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement separately
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (statement.trim().length === 0) continue;
            
            console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
            
            try {
                await prisma.$executeRawUnsafe(statement);
                console.log(`✓ Statement ${i + 1} completed successfully`);
            } catch (error) {
                console.error(`✗ Failed on statement ${i + 1}:`);
                console.error(`Statement: ${statement}`);
                console.error(`Error:`, error);
                throw error;
            }
        }
        
        console.log('RLS setup completed successfully');
        
    } catch (error) {
        console.error('Error setting up RLS:', error);
        throw error; // This will trigger the catch block in main()
    }
}

main()
    .then(async () => {
        console.log('RLS setup finished');
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error('RLS setup failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    });