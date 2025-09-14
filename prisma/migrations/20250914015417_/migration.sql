/*
  Warnings:

  - The values [PASSWORD_RESET] on the enum `VerificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `metadata` on the `VerificationToken` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."KycDocumentType" AS ENUM ('PASSPORT_PHOTO', 'NATIONAL_ID_FRONT', 'NATIONAL_ID_BACK', 'DRIVER_LICENSE_FRONT', 'DRIVER_LICENSE_BACK', 'BUSINESS_REGISTRATION', 'PROOF_OF_ADDRESS', 'BANK_STATEMENT', 'UTILITY_BILL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REQUIRES_RESUBMISSION');

-- CreateEnum
CREATE TYPE "public"."Relationship" AS ENUM ('PARENT', 'CHILD', 'SIBLING', 'SPOUSE', 'RELATIVE', 'FRIEND', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "public"."AddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."IdentificationType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVER_LICENSE', 'BUSINESS_REGISTRATION');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "public"."KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'ENHANCED_DUE_DILIGENCE');

-- CreateEnum
CREATE TYPE "public"."OutBoxStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."OutBoxType" AS ENUM ('ACCOUNT_VERIFICATION', 'MAGIC_LINK');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."VerificationType_new" AS ENUM ('EMAIL_VERIFICATION');
ALTER TABLE "public"."VerificationToken" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."VerificationToken" ALTER COLUMN "type" TYPE "public"."VerificationType_new" USING ("type"::text::"public"."VerificationType_new");
ALTER TYPE "public"."VerificationType" RENAME TO "VerificationType_old";
ALTER TYPE "public"."VerificationType_new" RENAME TO "VerificationType";
DROP TYPE "public"."VerificationType_old";
ALTER TABLE "public"."VerificationToken" ALTER COLUMN "type" SET DEFAULT 'EMAIL_VERIFICATION';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Tenant" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "public"."VerificationToken" DROP COLUMN "metadata";

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "type" "public"."CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "externalReference" TEXT,
    "externalSource" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "otherNames" TEXT,
    "gender" "public"."Gender",
    "dob" TIMESTAMP(3),
    "maritalStatus" "public"."MaritalStatus" NOT NULL,
    "spouse" TEXT,
    "spouseOccupation" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "nationalId" TEXT,
    "nationalIdType" "public"."IdentificationType",
    "kycVerified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "public"."KycStatus" NOT NULL DEFAULT 'PENDING',
    "kycVerifiedAt" TIMESTAMP(3),
    "kycVerifiedById" TEXT,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerBusiness" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "averageSalary" DECIMAL(15,2),
    "registrationNumber" TEXT,
    "taxId" TEXT,
    "industry" TEXT,
    "incorporationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NextOfKin" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationship" "public"."Relationship" NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "addressId" TEXT NOT NULL,
    "occupation" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NextOfKin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "public"."AddressType" NOT NULL DEFAULT 'HOME',
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'GH',
    "digitalAddress" TEXT,
    "landmark" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KycDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "documentType" "public"."KycDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Bucket" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "uploadedById" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Outbox" (
    "id" TEXT NOT NULL,
    "type" "public"."OutBoxType" NOT NULL DEFAULT 'ACCOUNT_VERIFICATION',
    "payload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "status" "public"."OutBoxStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_tenantId_mobile_idx" ON "public"."Customer"("tenantId", "mobile");

-- CreateIndex
CREATE INDEX "Customer_tenantId_email_idx" ON "public"."Customer"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Customer_tenantId_nationalId_idx" ON "public"."Customer"("tenantId", "nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_customerNumber_key" ON "public"."Customer"("tenantId", "customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_externalReference_key" ON "public"."Customer"("tenantId", "externalReference");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_nationalId_key" ON "public"."Customer"("tenantId", "nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBusiness_customerId_key" ON "public"."CustomerBusiness"("customerId");

-- CreateIndex
CREATE INDEX "CustomerBusiness_customerId_idx" ON "public"."CustomerBusiness"("customerId");

-- CreateIndex
CREATE INDEX "NextOfKin_customerId_idx" ON "public"."NextOfKin"("customerId");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "public"."Address"("customerId");

-- CreateIndex
CREATE INDEX "KycDocument_customerId_documentType_idx" ON "public"."KycDocument"("customerId", "documentType");

-- CreateIndex
CREATE INDEX "KycDocument_status_idx" ON "public"."KycDocument"("status");

-- CreateIndex
CREATE INDEX "KycDocument_s3Key_idx" ON "public"."KycDocument"("s3Key");

-- CreateIndex
CREATE INDEX "Outbox_status_type_createdAt_idx" ON "public"."Outbox"("status", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "public"."Tenant"("slug");

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_kycVerifiedById_fkey" FOREIGN KEY ("kycVerifiedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerBusiness" ADD CONSTRAINT "CustomerBusiness_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NextOfKin" ADD CONSTRAINT "NextOfKin_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KycDocument" ADD CONSTRAINT "KycDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
