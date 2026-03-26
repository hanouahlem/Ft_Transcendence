-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "password" DROP NOT NULL,
ADD COLUMN "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
