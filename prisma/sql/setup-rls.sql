-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "CustomerBusiness" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "NextOfKin" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "KycDocument" ENABLE ROW LEVEL SECURITY;

-- User table policy
CREATE POLICY user_tenant_isolation ON "User"
  USING (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  )
  WITH CHECK (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  );

-- Tenant table policy
CREATE POLICY tenant_isolation ON "Tenant" USING (
    "id" = current_setting ('app.current_tenant_id', true)
    OR current_setting ('app.is_super', true) = 'true'
)
WITH
    CHECK (
        "id" = current_setting ('app.current_tenant_id', true)
        OR current_setting ('app.is_super', true) = 'true'
    );

-- VerificationToken: Access through User relationship
CREATE POLICY verification_token_tenant_isolation ON "VerificationToken"
  USING (
    EXISTS (
      SELECT 1 FROM "User" u 
      WHERE u."id" = "VerificationToken"."userId" 
      AND (
        u."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" u 
      WHERE u."id" = "VerificationToken"."userId" 
      AND (
        u."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  );

-- Customer: Direct tenant isolation
CREATE POLICY customer_tenant_isolation ON "Customer"
  USING (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  )
  WITH CHECK (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  );

-- CustomerBusiness: Access through Customer relationship
CREATE POLICY customer_business_tenant_isolation ON "CustomerBusiness"
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "CustomerBusiness"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "CustomerBusiness"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  );

-- NextOfKin: Access through Customer relationship
CREATE POLICY next_of_kin_tenant_isolation ON "NextOfKin"
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "NextOfKin"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "NextOfKin"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  );

-- Address: Access through Customer relationship
CREATE POLICY address_tenant_isolation ON "Address"
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "Address"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "Address"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  );

-- KycDocument: Access through Customer relationship
CREATE POLICY kyc_document_tenant_isolation ON "KycDocument"
  USING (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "KycDocument"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Customer" c 
      WHERE c."id" = "KycDocument"."customerId" 
      AND (
        c."tenantId"::text = current_setting('app.current_tenant_id', true)
        OR current_setting('app.is_super', true) = 'true'
      )
    )
  );