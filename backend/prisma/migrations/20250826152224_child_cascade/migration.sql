-- DropForeignKey
ALTER TABLE "public"."Children" DROP CONSTRAINT "Children_folderId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Children" ADD CONSTRAINT "Children_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
