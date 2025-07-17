-- CreateTable: Create heroes table
CREATE TABLE "heroes" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "ctaButton" TEXT,
    "ctaLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "heroes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on siteId (one hero per site)
CREATE UNIQUE INDEX "heroes_siteId_key" ON "heroes"("siteId");

-- AddForeignKey: Link heroes to sites
ALTER TABLE "heroes" ADD CONSTRAINT "heroes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE; 