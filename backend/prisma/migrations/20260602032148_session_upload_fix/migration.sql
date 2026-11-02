/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `UploadSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UploadSession_fileId_key" ON "UploadSession"("fileId");
