import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// Extract policy names from SQL file automatically
function extractPolicyNamesFromSQL(sqlContent: string): string[] {
    const policyNames: string[] = [];
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        // Match CREATE POLICY statements
        const match = RegExp(/CREATE\s+POLICY\s+(\w+)\s+ON/i).exec(trimmed);
        if (match) {
            policyNames.push(match[1]);
        }
    }
    
    return policyNames;
}

// Check for specific policies defined in the SQL file
async function checkPoliciesFromSQL(sqlContent: string) {
    const expectedPolicies = extractPolicyNamesFromSQL(sqlContent);
    
    if (expectedPolicies.length === 0) {
        console.log('No CREATE POLICY statements found in SQL file');
        return { existing: [], expected: [] };
    }
    
    console.log(`Found ${expectedPolicies.length} policies in SQL file:`, expectedPolicies);
    
    const existingPolicies = await prisma.$queryRaw<Array<{policy_name: string, table_name: string}>>`
        SELECT 
            policyname as policy_name,
            tablename as table_name
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND policyname = ANY(${expectedPolicies})
    `;
    
    return { existing: existingPolicies, expected: expectedPolicies };
}

async function main() {
    try {
        const sqlPath = join(process.cwd(), 'prisma/sql/setup-rls.sql');
        
        console.log(`Looking for SQL file at: ${sqlPath}`);
        
        if (!existsSync(sqlPath)) {
            throw new Error(`SQL file not found at path: ${sqlPath}`);
        }
        
        const rlsSQL = readFileSync(sqlPath, 'utf-8');
        
        if (!rlsSQL.trim()) {
            throw new Error("SQL script is empty");
        }
        
        console.log('Checking if RLS is already enabled...');
        
        // Check for policies defined in the SQL file
        const { existing, expected } = await checkPoliciesFromSQL(rlsSQL);
        
        if (existing.length > 0) {
            console.log(`Found ${existing.length}/${expected.length} expected RLS policies:`);
            existing.forEach(policy => console.log(`  - ${policy.policy_name} on ${policy.table_name}`));
            
            if (existing.length === expected.length) {
                console.log('All expected RLS policies found, skipping setup');
                return;
            } else {
                console.log('Some policies missing, proceeding with setup...');
            }
        } else {
            console.log('No expected RLS policies found, setting up Row Level Security...');
        }
        
        console.log('Setting up Row Level Security...');
        
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
                console.log(`Statement ${i + 1} completed successfully`);
            } catch (error) {
                console.error(`Failed on statement ${i + 1}:`);
                console.error(`Statement: ${statement}`);
                console.error(`Error:`, error);
                throw error;
            }
        }
        
        console.log('RLS setup completed successfully');
        
        // Verify setup worked
        console.log('\nVerifying RLS setup...');
        const finalCheck = await checkPoliciesFromSQL(rlsSQL);
        console.log(`Verification complete: ${finalCheck.existing.length}/${finalCheck.expected.length} policies active`);
        
    } catch (error) {
        console.error('Error setting up RLS:', error);
        throw error;
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