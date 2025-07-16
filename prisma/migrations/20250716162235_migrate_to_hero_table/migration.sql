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

-- Data Migration: Copy existing hero data from sites to heroes table (only for sites that have hero data)
INSERT INTO "heroes" ("id", "title", "subtitle", "description", "imageUrl", "videoUrl", "ctaButton", "ctaLink", "createdAt", "updatedAt", "siteId")
SELECT 
    gen_random_uuid() as "id",
    "heroTitle" as "title",
    "heroSubtitle" as "subtitle", 
    "heroDescription" as "description",
    "heroImageUrl" as "imageUrl",
    "heroVideoUrl" as "videoUrl",
    "heroCTAButton" as "ctaButton",
    "heroCTALink" as "ctaLink",
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt",
    "id" as "siteId"
FROM "sites" 
WHERE "heroTitle" IS NOT NULL 
   OR "heroSubtitle" IS NOT NULL 
   OR "heroDescription" IS NOT NULL 
   OR "heroImageUrl" IS NOT NULL 
   OR "heroVideoUrl" IS NOT NULL 
   OR "heroCTAButton" IS NOT NULL 
   OR "heroCTALink" IS NOT NULL;

-- Drop hero columns from sites table
ALTER TABLE "sites" DROP COLUMN "heroTitle";
ALTER TABLE "sites" DROP COLUMN "heroSubtitle"; 
ALTER TABLE "sites" DROP COLUMN "heroDescription";
ALTER TABLE "sites" DROP COLUMN "heroImageUrl";
ALTER TABLE "sites" DROP COLUMN "heroVideoUrl";
ALTER TABLE "sites" DROP COLUMN "heroCTAButton";
ALTER TABLE "sites" DROP COLUMN "heroCTALink"; 