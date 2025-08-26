/*
  Warnings:

  - You are about to drop the column `format` on the `File` table. All the data in the column will be lost.
  - Added the required column `mimetype` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "format",
ADD COLUMN     "mimetype" TEXT NOT NULL;
