-- Add optional relation between events and event service packages
-- This migration is safe and non-destructive
-- It only adds optional foreign key fields

-- Add the optional foreign key column to events table
ALTER TABLE "events" ADD COLUMN "eventServicePackageId" TEXT;

-- Add the foreign key constraint with SET NULL on delete
ALTER TABLE "events" ADD CONSTRAINT "events_eventServicePackageId_fkey" 
FOREIGN KEY ("eventServicePackageId") REFERENCES "event_service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- This migration is completely safe:
-- - No existing data is modified
-- - No data is deleted
-- - The new field is optional (nullable)
-- - Existing events will continue to work normally
-- - New events can optionally be linked to event service packages 