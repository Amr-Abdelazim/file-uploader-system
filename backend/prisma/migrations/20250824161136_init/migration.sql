-- CreateEnum
CREATE TYPE "public"."PermissionType" AS ENUM ('private', 'shared', 'public');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Children" (
    "folderId" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "isFile" BOOLEAN NOT NULL,

    CONSTRAINT "Children_pkey" PRIMARY KEY ("folderId","objectId")
);

-- CreateTable
CREATE TABLE "public"."RefreshTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenUuid" TEXT NOT NULL,
    "hashedRefreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shared" (
    "objectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Shared_pkey" PRIMARY KEY ("objectId","userId")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "objectId" TEXT NOT NULL,
    "type" "public"."PermissionType" NOT NULL,
    "nested" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "public"."root" (
    "folderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "root_pkey" PRIMARY KEY ("folderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_tokenUuid_key" ON "public"."RefreshTokens"("tokenUuid");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_hashedRefreshToken_key" ON "public"."RefreshTokens"("hashedRefreshToken");

-- CreateIndex
CREATE INDEX "RefreshTokens_tokenUuid_userId_idx" ON "public"."RefreshTokens"("tokenUuid", "userId");

-- CreateIndex
CREATE INDEX "Shared_objectId_userId_idx" ON "public"."Shared"("objectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_objectId_key" ON "public"."Permission"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "root_userId_key" ON "public"."root"("userId");

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Children" ADD CONSTRAINT "Children_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "public"."Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shared" ADD CONSTRAINT "Shared_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."root" ADD CONSTRAINT "root_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
