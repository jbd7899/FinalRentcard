-- Add Document Storage and Verification
CREATE TABLE IF NOT EXISTS "tenant_documents" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenant_profiles"("id"),
  "document_type" TEXT NOT NULL,
  "document_url" TEXT NOT NULL,
  "is_verified" BOOLEAN DEFAULT false,
  "verified_by" INTEGER REFERENCES "users"("id"),
  "verified_at" TIMESTAMP,
  "uploaded_at" TIMESTAMP DEFAULT now()
);

-- Add Messaging and Communication
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" SERIAL PRIMARY KEY,
  "property_id" INTEGER REFERENCES "properties"("id"),
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "conversation_participants" (
  "id" SERIAL PRIMARY KEY,
  "conversation_id" INTEGER REFERENCES "conversations"("id"),
  "user_id" INTEGER REFERENCES "users"("id"),
  "joined_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" SERIAL PRIMARY KEY,
  "conversation_id" INTEGER REFERENCES "conversations"("id"),
  "sender_id" INTEGER REFERENCES "users"("id"),
  "content" TEXT NOT NULL,
  "sent_at" TIMESTAMP DEFAULT now(),
  "read_at" TIMESTAMP
);

-- Add Property Management Enhancements
CREATE TABLE IF NOT EXISTS "property_images" (
  "id" SERIAL PRIMARY KEY,
  "property_id" INTEGER REFERENCES "properties"("id"),
  "image_url" TEXT NOT NULL,
  "is_primary" BOOLEAN DEFAULT false,
  "uploaded_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "property_amenities" (
  "id" SERIAL PRIMARY KEY,
  "property_id" INTEGER REFERENCES "properties"("id"),
  "amenity_type" TEXT NOT NULL,
  "description" TEXT
);

-- Add Analytics and Reporting
CREATE TABLE IF NOT EXISTS "property_analytics" (
  "id" SERIAL PRIMARY KEY,
  "property_id" INTEGER REFERENCES "properties"("id"),
  "view_count" INTEGER DEFAULT 0,
  "application_count" INTEGER DEFAULT 0,
  "average_application_score" INTEGER,
  "last_updated" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_activity" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "activity_type" TEXT NOT NULL,
  "metadata" JSONB,
  "timestamp" TIMESTAMP DEFAULT now()
);

-- Add Notifications System
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "type" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "is_read" BOOLEAN DEFAULT false,
  "related_entity_type" TEXT,
  "related_entity_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT now()
);

-- Add Tenant References
CREATE TABLE IF NOT EXISTS "tenant_references" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenant_profiles"("id"),
  "name" TEXT NOT NULL,
  "relationship" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "is_verified" BOOLEAN DEFAULT false,
  "verification_date" TIMESTAMP,
  "notes" TEXT
);

-- Add Roommates/Co-applicants
CREATE TABLE IF NOT EXISTS "roommate_groups" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "roommate_group_members" (
  "id" SERIAL PRIMARY KEY,
  "group_id" INTEGER REFERENCES "roommate_groups"("id"),
  "tenant_id" INTEGER REFERENCES "tenant_profiles"("id"),
  "is_primary" BOOLEAN DEFAULT false,
  "joined_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "group_applications" (
  "id" SERIAL PRIMARY KEY,
  "group_id" INTEGER REFERENCES "roommate_groups"("id"),
  "property_id" INTEGER REFERENCES "properties"("id"),
  "status" TEXT NOT NULL,
  "submitted_at" TIMESTAMP DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_tenant_documents_tenant_id" ON "tenant_documents"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_property_images_property_id" ON "property_images"("property_id");
CREATE INDEX IF NOT EXISTS "idx_property_amenities_property_id" ON "property_amenities"("property_id");
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_participants_user_id" ON "conversation_participants"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_references_tenant_id" ON "tenant_references"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_roommate_group_members_tenant_id" ON "roommate_group_members"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_group_applications_group_id" ON "group_applications"("group_id");
CREATE INDEX IF NOT EXISTS "idx_group_applications_property_id" ON "group_applications"("property_id"); 