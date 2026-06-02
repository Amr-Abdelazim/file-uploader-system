/*
  Warnings:

  - You are about to drop the column `public_id` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `nested` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `Children` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shared` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `root` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ownerId,folderId,name]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,parentId,name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,objectId,objectType]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folderId` to the `File` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Permission` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `objectType` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ObjectType" AS ENUM ('file', 'folder');

-- CreateEnum
CREATE TYPE "public"."PermissionRole" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('private', 'public', 'unlisted');

-- DropForeignKey
ALTER TABLE "public"."Children" DROP CONSTRAINT "Children_folderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shared" DROP CONSTRAINT "Shared_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."root" DROP CONSTRAINT "root_userId_fkey";

-- DropIndex
DROP INDEX "public"."Permission_objectId_key";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "public_id",
ADD COLUMN     "folderId" TEXT NOT NULL,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "isComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalChunks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uploadedChunks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "public"."Visibility" NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "visibility" "public"."Visibility" NOT NULL DEFAULT 'private',
ALTER COLUMN "size" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."Permission" DROP COLUMN "nested",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "objectType" "public"."ObjectType" NOT NULL,
ADD COLUMN     "role" "public"."PermissionRole" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "public"."Children";

-- DropTable
DROP TABLE "public"."Shared";

-- DropTable
DROP TABLE "public"."root";

-- DropEnum
DROP TYPE "public"."PermissionType";

-- CreateTable
CREATE TABLE "public"."ChunkFile" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "hash" TEXT,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChunkFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UploadSession" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploading',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChunkFile_fileId_index_key" ON "public"."ChunkFile"("fileId", "index");

-- CreateIndex
CREATE UNIQUE INDEX "File_ownerId_folderId_name_key" ON "public"."File"("ownerId", "folderId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_ownerId_parentId_name_key" ON "public"."Folder"("ownerId", "parentId", "name");

-- CreateIndex
CREATE INDEX "Permission_objectId_objectType_idx" ON "public"."Permission"("objectId", "objectType");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_objectId_objectType_key" ON "public"."Permission"("userId", "objectId", "objectType");

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChunkFile" ADD CONSTRAINT "ChunkFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UploadSession" ADD CONSTRAINT "UploadSession_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
