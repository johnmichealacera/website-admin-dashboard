-- CreateTable
-- This migration ONLY adds the new EventServicePackage table
-- It does NOT modify any existing data
-- It does NOT seed any data
-- It is completely safe and non-destructive

CREATE TABLE "event_service_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION DEFAULT 0,
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "addOns" JSONB,
    "freebies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventServiceId" TEXT NOT NULL,

    CONSTRAINT "event_service_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_service_packages_eventServiceId_name_key" ON "event_service_packages"("eventServiceId", "name");

-- AddForeignKey
ALTER TABLE "event_service_packages" ADD CONSTRAINT "event_service_packages_eventServiceId_fkey" FOREIGN KEY ("eventServiceId") REFERENCES "event_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NO DATA INSERTION - This migration is purely structural
-- Existing event services will remain unchanged
-- Users can manually add packages through the UI when ready 