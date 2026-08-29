-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_LIKE';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "commentId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
