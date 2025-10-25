/*
  Warnings:

  - You are about to drop the column `identidadeMotorista` on the `entregas` table. All the data in the column will be lost.
  - You are about to drop the column `nomeMotorista` on the `entregas` table. All the data in the column will be lost.
  - You are about to drop the column `placaVeiculo` on the `entregas` table. All the data in the column will be lost.
  - You are about to drop the column `tipoVeiculo` on the `entregas` table. All the data in the column will be lost.
  - Added the required column `motoristaId` to the `entregas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veiculoId` to the `entregas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "entregas" DROP COLUMN "identidadeMotorista",
DROP COLUMN "nomeMotorista",
DROP COLUMN "placaVeiculo",
DROP COLUMN "tipoVeiculo",
ADD COLUMN     "motoristaId" INTEGER NOT NULL,
ADD COLUMN     "veiculoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "motoristas" (
    "id" SERIAL NOT NULL,
    "primeiroNome" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "operadora" TEXT,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "rg" TEXT NOT NULL,
    "orgaoEmissor" TEXT NOT NULL,
    "ufEmissor" TEXT NOT NULL,
    "municipioNasc" TEXT NOT NULL,
    "dataEmissaoRg" TIMESTAMP(3) NOT NULL,
    "telefone" TEXT,
    "nomeMae" TEXT NOT NULL,
    "nomePai" TEXT NOT NULL,
    "pis" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'BRASIL',
    "sexo" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "resideDesdeMes" INTEGER NOT NULL,
    "resideDesdeAno" INTEGER NOT NULL,
    "numeroHabilitacao" TEXT NOT NULL,
    "cidadeCnh" TEXT NOT NULL,
    "categoriaCnh" TEXT NOT NULL,
    "dataEmissaoCnh" TIMESTAMP(3) NOT NULL,
    "validadeCnh" TIMESTAMP(3) NOT NULL,
    "dataPrimeiraCnh" TIMESTAMP(3) NOT NULL,
    "codSegurancaCnh" TEXT NOT NULL,
    "anexoCnh" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motoristas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "renavam" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anoFabricacao" INTEGER NOT NULL,
    "anoModelo" INTEGER NOT NULL,
    "cor" TEXT NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL,
    "baseOperacao" TEXT NOT NULL,
    "tipoVeiculo" TEXT NOT NULL,
    "categoriaFrota" TEXT NOT NULL,
    "seguradora" TEXT,
    "vigencia" TIMESTAMP(3),
    "taraVeiculo" DOUBLE PRECISION,
    "capacidadeCarga" DOUBLE PRECISION,
    "capacidadeCargaM3" DOUBLE PRECISION,
    "tipoCarroceria" TEXT,
    "ufEmplacada" TEXT NOT NULL,
    "tipoRodado" TEXT,
    "certificadoCronotacografo" TEXT,
    "medidasRodado" TEXT,
    "consumoKmLitro" DOUBLE PRECISION,
    "kmMaximoRota" DOUBLE PRECISION,
    "capacidadeTanque" DOUBLE PRECISION,
    "tipoResponsavel" TEXT,
    "unidadeProprietaria" TEXT,
    "financiamento" TEXT,
    "instituicaoFinanceira" TEXT,
    "tabela" TEXT,
    "valorEntrega" DOUBLE PRECISION,
    "valorKmRodado" DOUBLE PRECISION,
    "valorDiaria" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_cpf_key" ON "motoristas"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_email_key" ON "motoristas"("email");

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_rg_key" ON "motoristas"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "motoristas_numeroHabilitacao_key" ON "motoristas"("numeroHabilitacao");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_renavam_key" ON "veiculos"("renavam");

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "motoristas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
