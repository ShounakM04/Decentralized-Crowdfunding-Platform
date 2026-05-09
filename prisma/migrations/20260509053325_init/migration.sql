-- CreateTable
CREATE TABLE "User" (
    "ethAddress" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("ethAddress")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "creatorAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ethAddress_key" ON "User"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_ethAddress_key" ON "Campaign"("ethAddress");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_creatorAddress_fkey" FOREIGN KEY ("creatorAddress") REFERENCES "User"("ethAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
