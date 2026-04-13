ALTER TABLE "Notification"
ADD COLUMN "type" TEXT;

UPDATE "Notification"
SET "type" = 'MESSAGE'
WHERE "type" IS NULL;

ALTER TABLE "Notification"
ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "Notification"
ADD COLUMN "actorId" INTEGER;

UPDATE "Notification"
SET "actorId" = "userId"
WHERE "actorId" IS NULL;

ALTER TABLE "Notification"
ALTER COLUMN "actorId" SET NOT NULL;

ALTER TABLE "Notification"
ADD COLUMN "postId" INTEGER;

ALTER TABLE "Notification"
DROP COLUMN "content";

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_actorId_idx" ON "Notification"("actorId");
CREATE INDEX "Notification_postId_idx" ON "Notification"("postId");

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
