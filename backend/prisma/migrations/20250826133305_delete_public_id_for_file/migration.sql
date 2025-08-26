/*
  Warnings:

  - You are about to drop the column `publicId` on the `File` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."File_publicId_key";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "publicId";
