-- Step 1: Add the new packages column
ALTER TABLE "event_services" ADD COLUMN "packages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Migrate existing category data to packages array
-- Convert non-null category values to single-element packages arrays
UPDATE "event_services" 
SET "packages" = ARRAY["category"] 
WHERE "category" IS NOT NULL AND "category" != '';

-- Step 3: Remove the old category column
ALTER TABLE "event_services" DROP COLUMN "category"; 