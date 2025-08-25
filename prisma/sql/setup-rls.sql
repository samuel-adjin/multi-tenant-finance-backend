-- Complete RLS without any functions
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;


-- Policies for future tables
-- CREATE POLICY tenant_loan_policy ON "Loan"
--   USING ("tenantId" = current_tenant_id());

CREATE POLICY user_tenant_isolation ON "User"
  USING (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  )
  WITH CHECK (
    "tenantId"::text = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  );

CREATE POLICY tenant_isolation ON "Tenant"  
  USING (
    "id" = current_setting('app.current_tenant_id', true)
    OR current_setting('app.is_super', true) = 'true'
  )
  WITH CHECK (
    "id" = current_setting('app.current_tenant_id', true)  
    OR current_setting('app.is_super', true) = 'true'
  );