
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;

ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" FORCE ROW LEVEL SECURITY;

ALTER TABLE "CustomerBusiness" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomerBusiness" FORCE ROW LEVEL SECURITY;

ALTER TABLE "NextOfKin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NextOfKin" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" FORCE ROW LEVEL SECURITY;

ALTER TABLE "KycDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KycDocument" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Sequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sequence" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Prefix" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prefix" FORCE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS user_tenant_isolation ON "User";
DROP POLICY IF EXISTS tenant_isolation ON "Tenant";
DROP POLICY IF EXISTS verification_token_tenant_isolation ON "VerificationToken";
DROP POLICY IF EXISTS customer_tenant_isolation ON "Customer";
DROP POLICY IF EXISTS customer_business_tenant_isolation ON "CustomerBusiness";
DROP POLICY IF EXISTS next_of_kin_tenant_isolation ON "NextOfKin";
DROP POLICY IF EXISTS address_tenant_isolation ON "Address";
DROP POLICY IF EXISTS kyc_document_tenant_isolation ON "KycDocument";
DROP POLICY IF EXISTS sequence_tenant_isolation ON "Sequence";
DROP POLICY IF EXISTS prefix_tenant_isolation ON "Prefix";

-- User table policy - STRICT VERSION
CREATE POLICY user_tenant_isolation ON "User"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

-- Tenant table policy - STRICT VERSION
CREATE POLICY tenant_isolation ON "Tenant"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "id" = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "id" = current_setting('app.current_tenant_id', true)
    )
  );

-- VerificationToken: Access through User relationship - STRICT VERSION
CREATE POLICY verification_token_tenant_isolation ON "VerificationToken"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "User" u 
        WHERE u."id" = "VerificationToken"."userId" 
        AND u."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "User" u 
        WHERE u."id" = "VerificationToken"."userId" 
        AND u."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  );

-- Customer: Direct tenant isolation - STRICT VERSION
CREATE POLICY customer_tenant_isolation ON "Customer"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

-- CustomerBusiness: Access through Customer relationship - STRICT VERSION
CREATE POLICY customer_business_tenant_isolation ON "CustomerBusiness"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "CustomerBusiness"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "CustomerBusiness"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  );

-- NextOfKin: Access through Customer relationship - STRICT VERSION
CREATE POLICY next_of_kin_tenant_isolation ON "NextOfKin"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "NextOfKin"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "NextOfKin"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  );

-- Address: Access through Customer relationship - STRICT VERSION
CREATE POLICY address_tenant_isolation ON "Address"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "Address"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "Address"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  );

-- KycDocument: Access through Customer relationship - STRICT VERSION
CREATE POLICY kyc_document_tenant_isolation ON "KycDocument"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "KycDocument"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND EXISTS (
        SELECT 1 FROM "Customer" c 
        WHERE c."id" = "KycDocument"."customerId" 
        AND c."tenantId" = current_setting('app.current_tenant_id', true)
      )
    )
  );

-- Sequence table policy - STRICT VERSION
CREATE POLICY sequence_tenant_isolation ON "Sequence"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

-- Prefix table policy - STRICT VERSION
CREATE POLICY prefix_tenant_isolation ON "Prefix"
  USING (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.is_super', true) = 'true'
    OR (
      current_setting('app.current_tenant_id', true) IS NOT NULL
      AND current_setting('app.current_tenant_id', true) != ''
      AND "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

-- Verify setup
SELECT 
    t.tablename,
    t.rowsecurity as "RLS Enabled",
    p.policyname as "Policy Name"
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'User', 'Tenant', 'VerificationToken', 'Customer', 
    'CustomerBusiness', 'NextOfKin', 'Address', 
    'KycDocument', 'Sequence', 'Prefix'
  )
ORDER BY t.tablename;