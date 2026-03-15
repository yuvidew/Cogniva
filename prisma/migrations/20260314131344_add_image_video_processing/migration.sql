-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "imageProcessingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoProcessingEnabled" BOOLEAN NOT NULL DEFAULT false;
