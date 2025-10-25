/*
  Warnings:

  - Made the column `accessToken` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiresAt` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `realmId` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshTokenExpiresAt` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `quickbooks_config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "quickbooks_config" ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "expiresAt" SET NOT NULL,
ALTER COLUMN "realmId" SET NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL,
ALTER COLUMN "refreshTokenExpiresAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
