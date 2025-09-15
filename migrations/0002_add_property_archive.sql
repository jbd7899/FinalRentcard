-- Add isArchived field to properties table
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN DEFAULT false; 