/*
  Warnings:

  - Added the required column `ownerId` to the `agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "agent_ownerId_idx" ON "agent"("ownerId");

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
