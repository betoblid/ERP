-- DropIndex
DROP INDEX "public"."quickbooks_config_realmId_key";

-- AlterTable
ALTER TABLE "quickbooks_config" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "isConfigured" SET DEFAULT false;
