-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "image_generation_status" AS ENUM ('pending', 'generating', 'completed', 'failed');

-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "imageGenerationEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "processed_image" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "processingType" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "status" "processing_status" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,

    CONSTRAINT "processed_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processed_video" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "thumbnailUrl" TEXT,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "processingType" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "status" "processing_status" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,

    CONSTRAINT "processed_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_image" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "imageUrl" TEXT,
    "width" INTEGER NOT NULL DEFAULT 1024,
    "height" INTEGER NOT NULL DEFAULT 1024,
    "model" VARCHAR(100) NOT NULL,
    "style" VARCHAR(50),
    "quality" VARCHAR(20),
    "metadata" JSONB,
    "status" "image_generation_status" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,

    CONSTRAINT "generated_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processed_image_userId_idx" ON "processed_image"("userId");

-- CreateIndex
CREATE INDEX "processed_image_agentId_idx" ON "processed_image"("agentId");

-- CreateIndex
CREATE INDEX "processed_image_status_idx" ON "processed_image"("status");

-- CreateIndex
CREATE INDEX "processed_image_createdAt_idx" ON "processed_image"("createdAt");

-- CreateIndex
CREATE INDEX "processed_video_userId_idx" ON "processed_video"("userId");

-- CreateIndex
CREATE INDEX "processed_video_agentId_idx" ON "processed_video"("agentId");

-- CreateIndex
CREATE INDEX "processed_video_status_idx" ON "processed_video"("status");

-- CreateIndex
CREATE INDEX "processed_video_createdAt_idx" ON "processed_video"("createdAt");

-- CreateIndex
CREATE INDEX "generated_image_userId_idx" ON "generated_image"("userId");

-- CreateIndex
CREATE INDEX "generated_image_agentId_idx" ON "generated_image"("agentId");

-- CreateIndex
CREATE INDEX "generated_image_status_idx" ON "generated_image"("status");

-- CreateIndex
CREATE INDEX "generated_image_createdAt_idx" ON "generated_image"("createdAt");

-- AddForeignKey
ALTER TABLE "processed_image" ADD CONSTRAINT "processed_image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_image" ADD CONSTRAINT "processed_image_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_video" ADD CONSTRAINT "processed_video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processed_video" ADD CONSTRAINT "processed_video_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_image" ADD CONSTRAINT "generated_image_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
