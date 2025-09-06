-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'LOAN_OFFICER', 'MANAGER', 'AUDITOR', 'ADMIN', 'CUSTOMER_SERVICE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'LOAN_OFFICER';
