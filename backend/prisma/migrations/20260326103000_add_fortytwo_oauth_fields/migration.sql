ALTER TABLE "User"
ADD COLUMN "fortyTwoId" TEXT;

CREATE UNIQUE INDEX "User_fortyTwoId_key" ON "User"("fortyTwoId");
