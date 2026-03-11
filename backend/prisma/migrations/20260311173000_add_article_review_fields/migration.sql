-- AlterTable
ALTER TABLE "Article"
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedBy" TEXT;

-- CreateIndex
CREATE INDEX "Article_reviewedBy_idx" ON "Article"("reviewedBy");

-- AddForeignKey
ALTER TABLE "Article"
ADD CONSTRAINT "Article_reviewedBy_fkey"
FOREIGN KEY ("reviewedBy") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
