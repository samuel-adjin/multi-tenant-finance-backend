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
        const match = /CREATE\s+POLICY\s+(\w+)\s+ON/i.exec(trimmed);
        if (match) {
            policyNames.push(match[1]);
        }
    }

    return policyNames;
}

// Extract table names that should have RLS enabled from SQL file
function extractTableNamesFromSQL(sqlContent: string): string[] {
    const tableNames: string[] = [];
    const lines = sqlContent.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        const match = /ALTER\s+TABLE\s+"?(\w+)"?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.exec(trimmed);
        if (match) {
            tableNames.push(match[1]);
        }
    }

    return tableNames;
}

function parseSQL(sqlContent: string): string[] {
    const cleanedSQL = sqlContent
        .split('\n')
        .map(line => {
            const commentIndex = line.indexOf('--');
            if (commentIndex !== -1) {
                return line.substring(0, commentIndex);
            }
            return line;
        })
        .join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        .trim();

    const statements = cleanedSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)
        .map(stmt => stmt + ';');

    if (statements[statements.length - 1] === ';') {
        statements.pop();
    }

    return statements;
}

async function checkPoliciesFromSQL(sqlContent: string) {
    const expectedPolicies = extractPolicyNamesFromSQL(sqlContent);

    if (expectedPolicies.length === 0) {
        console.log('No CREATE POLICY statements found in SQL file');
        return { existing: [], expected: [] };
    }

    console.log(`Found ${expectedPolicies.length} policies in SQL file:`, expectedPolicies);

    const existingPolicies = await prisma.$queryRaw<Array<{ policy_name: string, table_name: string }>>`
        SELECT 
            policyname as policy_name,
            tablename as table_name
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND policyname = ANY(${expectedPolicies})
    `;

    return { existing: existingPolicies, expected: expectedPolicies };
}

// Check if RLS is enabled on tables 
async function checkRLSStatus(tableNames: string[]) {
    const rlsStatus = await prisma.$queryRaw<Array<{ table_name: string, row_level_security: boolean }>>`
        SELECT 
            tablename as table_name,
            rowsecurity as row_level_security
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename = ANY(${tableNames})
    `;

    return rlsStatus;
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

        // Extract table names from SQL file dynamically
        const expectedTables = extractTableNamesFromSQL(rlsSQL);
        console.log('Tables expected to have RLS enabled:', expectedTables);

        // Check current RLS status for all expected tables
        const rlsStatus = await checkRLSStatus(expectedTables);
        console.log('Current RLS status:');
        rlsStatus.forEach(table => {
            console.log(`  - ${table.table_name}: ${table.row_level_security ? 'ENABLED' : 'DISABLED'}`);
        });

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

        const statements = parseSQL(rlsSQL);

        console.log(`Found ${statements.length} SQL statements to execute`);

        statements.forEach((stmt, i) => {
            console.log(`Statement ${i + 1}: ${stmt.substring(0, 80)}${stmt.length > 80 ? '...' : ''}`);
        });

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
            console.log(`${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

            try {
                await prisma.$executeRawUnsafe(statement);
                console.log(`Statement ${i + 1} completed successfully`);
            } catch (error) {
                console.error(`Failed on statement ${i + 1}:`);
                console.error(`Statement: ${statement}`);
                console.error(`Error:`, error);

                if (error instanceof Error && error.message.includes('already exists')) {
                    console.log(`Skipping duplicate policy/setting: ${error.message}`);
                    continue;
                } else {
                    throw error;
                }
            }
        }

        console.log('\n RLS setup completed successfully');

        // Verify setup
        console.log('\nVerifying RLS setup...');
        const finalCheck = await checkPoliciesFromSQL(rlsSQL);
        const finalRLSStatus = await checkRLSStatus(expectedTables);
        console.log("finalRLSStatus", finalRLSStatus);
        console.log('\nFinal RLS status:');
        finalRLSStatus.forEach(table => {
            console.log(`  - ${table.table_name}: ${table.row_level_security ? 'ENABLED' : 'DISABLED'}`);
        });

        console.log(`\nVerification complete: ${finalCheck.existing.length}/${finalCheck.expected.length} policies active`);
        finalCheck.existing.forEach(policy => {
            console.log(`  ${policy.policy_name} on ${policy.table_name}`);
        });

    } catch (error) {
        console.error('Error setting up RLS:', error);
        throw error;
    }
}

main()
    .then(async () => {
        console.log('\n RLS setup finished');
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error('\n RLS setup failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    });