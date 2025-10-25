/*
  Warnings:

  - You are about to drop the column `created_at` on the `categorias` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `categorias` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `quickbooks_id` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `sync_status` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `synced_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_documento` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `salario` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `funcionarios` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `quickbooks_id` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `sync_status` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `synced_at` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pedidos` table. All the data in the column will be lost.
  - You are about to drop the column `categoria_id` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `estoque_atual` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `estoque_minimo` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `quickbooks_id` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `sync_status` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `synced_at` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the column `access_token` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `realm_id` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_at` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `quickbooks_config` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `sync_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity_id` on the `sync_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entity_type` on the `sync_logs` table. All the data in the column will be lost.
  - You are about to drop the column `error_message` on the `sync_logs` table. All the data in the column will be lost.
  - You are about to drop the column `quickbooks_id` on the `sync_logs` table. All the data in the column will be lost.
  - You are about to drop the `itens_pedido` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[quickbooksId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `funcionarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quickbooksId]` on the table `funcionarios` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero]` on the table `pedidos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quickbooksId]` on the table `pedidos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quickbooksId]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[realmId]` on the table `quickbooks_config` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `categorias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `funcionarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jornadaFim` to the `funcionarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jornadaInicio` to the `funcionarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `funcionarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pedidos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoriaId` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `sync_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `sync_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `sync_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."itens_pedido" DROP CONSTRAINT "itens_pedido_pedido_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."itens_pedido" DROP CONSTRAINT "itens_pedido_produto_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pedidos" DROP CONSTRAINT "pedidos_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."produtos" DROP CONSTRAINT "produtos_categoria_id_fkey";

-- DropIndex
DROP INDEX "public"."clientes_email_key";

-- DropIndex
DROP INDEX "public"."quickbooks_config_realm_id_key";

-- AlterTable
ALTER TABLE "categorias" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "created_at",
DROP COLUMN "quickbooks_id",
DROP COLUMN "sync_status",
DROP COLUMN "synced_at",
DROP COLUMN "tipo_documento",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "tipoDocumento" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "funcionarios" DROP COLUMN "created_at",
DROP COLUMN "salario",
DROP COLUMN "updated_at",
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "jornadaFim" TEXT NOT NULL,
ADD COLUMN     "jornadaInicio" TEXT NOT NULL,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "telefone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "cliente_id",
DROP COLUMN "created_at",
DROP COLUMN "quickbooks_id",
DROP COLUMN "sync_status",
DROP COLUMN "synced_at",
DROP COLUMN "updated_at",
ADD COLUMN     "clienteId" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "categoria_id",
DROP COLUMN "created_at",
DROP COLUMN "descricao",
DROP COLUMN "estoque_atual",
DROP COLUMN "estoque_minimo",
DROP COLUMN "quickbooks_id",
DROP COLUMN "sync_status",
DROP COLUMN "synced_at",
DROP COLUMN "updated_at",
ADD COLUMN     "categoriaId" INTEGER NOT NULL,
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estoqueAtual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "syncStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "quickbooks_config" DROP COLUMN "access_token",
DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "realm_id",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_at",
DROP COLUMN "updated_at",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isConfigured" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "realmId" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sync_logs" DROP COLUMN "created_at",
DROP COLUMN "entity_id",
DROP COLUMN "entity_type",
DROP COLUMN "error_message",
DROP COLUMN "quickbooks_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "entityId" INTEGER NOT NULL,
ADD COLUMN     "entityType" TEXT NOT NULL,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "quickbooksId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."itens_pedido";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'usuario',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "funcionarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos" (
    "id" SERIAL NOT NULL,
    "funcionarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_funcionarioId_key" ON "usuarios"("funcionarioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_quickbooksId_key" ON "clientes"("quickbooksId");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_quickbooksId_key" ON "funcionarios"("quickbooksId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_quickbooksId_key" ON "pedidos"("quickbooksId");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_quickbooksId_key" ON "produtos"("quickbooksId");

-- CreateIndex
CREATE UNIQUE INDEX "quickbooks_config_realmId_key" ON "quickbooks_config"("realmId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos" ADD CONSTRAINT "pontos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
