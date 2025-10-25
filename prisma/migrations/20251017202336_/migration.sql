/*
  Warnings:

  - You are about to drop the column `isConfigured` on the `quickbooks_config` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[estimateId]` on the table `pedidos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[realmId]` on the table `quickbooks_config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `funcionarioId` to the `ordens_servico` table without a default value. This is not possible if the table is not empty.
  - Made the column `entityId` on table `sync_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN     "funcionarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "estimateId" INTEGER;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "descricao" TEXT;

-- AlterTable
ALTER TABLE "quickbooks_config" DROP COLUMN "isConfigured",
ADD COLUMN     "expiresIn" INTEGER NOT NULL DEFAULT 3600;

-- AlterTable
ALTER TABLE "sync_logs" ALTER COLUMN "entityId" SET NOT NULL;

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "estimateId" INTEGER,
    "quickbooksInvoiceId" TEXT,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "horarioEntrega" TEXT NOT NULL,
    "tipoVeiculo" TEXT NOT NULL,
    "placaVeiculo" TEXT NOT NULL,
    "nomeMotorista" TEXT NOT NULL,
    "identidadeMotorista" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendada',
    "observacoes" TEXT,
    "nomeRecebedor" TEXT,
    "identidadeRecebedor" TEXT,
    "dataRecebimento" TIMESTAMP(3),
    "fotoComprovante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entregas_pedidoId_key" ON "entregas"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_estimateId_key" ON "pedidos"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "quickbooks_config_realmId_key" ON "quickbooks_config"("realmId");

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
