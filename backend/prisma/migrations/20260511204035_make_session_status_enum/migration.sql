/*
  Warnings:

  - The `status` column on the `UploadSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('uploading', 'merging', 'done', 'failed');

-- AlterTable
ALTER TABLE "public"."UploadSession" DROP COLUMN "status",
ADD COLUMN     "status" "public"."SessionStatus" NOT NULL DEFAULT 'uploading';
