-- AlterTable
ALTER TABLE "file_upload" ADD COLUMN     "agentId" TEXT;

-- CreateIndex
CREATE INDEX "file_upload_agentId_idx" ON "file_upload"("agentId");

-- AddForeignKey
ALTER TABLE "file_upload" ADD CONSTRAINT "file_upload_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
