-- CreateEnum
CREATE TYPE "agent_model_provider" AS ENUM ('openai', 'anthropic', 'google');

-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "avatar" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "model" "agent_model_provider" NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "memoryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "webSearchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fileUploadEnabled" BOOLEAN NOT NULL DEFAULT false,
    "strictMode" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_isActive_idx" ON "agent"("isActive");
