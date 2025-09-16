-- CreateTable
CREATE TABLE "public"."Sequence" (
    "id" TEXT NOT NULL,
    "lastSequence" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prefix" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prefix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_tenantId_key" ON "public"."Sequence"("tenantId");

-- CreateIndex
CREATE INDEX "Sequence_tenantId_idx" ON "public"."Sequence"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Prefix_code_key" ON "public"."Prefix"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Prefix_tenantId_key" ON "public"."Prefix"("tenantId");

-- AddForeignKey
ALTER TABLE "public"."Sequence" ADD CONSTRAINT "Sequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prefix" ADD CONSTRAINT "Prefix_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
