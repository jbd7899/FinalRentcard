CREATE TABLE "interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"property_id" integer,
	"landlord_id" integer NOT NULL,
	"contact_info" json NOT NULL,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"viewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "landlord_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_name" text,
	"screening_criteria" json
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"landlord_id" integer,
	"address" text NOT NULL,
	"rent" integer NOT NULL,
	"description" text,
	"available" boolean DEFAULT true,
	"bedrooms" integer NOT NULL,
	"bathrooms" integer NOT NULL,
	"parking" text,
	"available_from" timestamp,
	"screening_page_slug" text,
	"requirements" json,
	"view_count" integer DEFAULT 0,
	"is_archived" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "rent_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"has_pets" boolean NOT NULL,
	"current_employer" text NOT NULL,
	"years_employed" text NOT NULL,
	"monthly_income" integer NOT NULL,
	"current_address" text NOT NULL,
	"current_rent" integer NOT NULL,
	"move_in_date" text NOT NULL,
	"max_rent" integer NOT NULL,
	"has_roommates" boolean NOT NULL,
	"credit_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "screening_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"landlord_id" integer,
	"business_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"business_email" text NOT NULL,
	"screening_criteria" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "screening_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "share_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"tenant_id" integer NOT NULL,
	"scope" text DEFAULT 'rentcard' NOT NULL,
	"expires_at" timestamp,
	"revoked" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "share_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tenant_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"move_in_date" timestamp,
	"max_rent" integer,
	"employment_info" json,
	"credit_score" integer,
	"rental_history" json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"user_type" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"user_id" integer,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "group_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"property_id" integer,
	"status" text NOT NULL,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"sender_id" integer,
	"content" text NOT NULL,
	"sent_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "neighborhood_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"safety_rating" real,
	"walkability_score" integer,
	"transit_score" integer,
	"nearby_amenities" json,
	"public_transport" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"related_entity_type" text,
	"related_entity_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"amenity_type" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "property_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"view_count" integer DEFAULT 0,
	"application_count" integer DEFAULT 0,
	"average_application_score" integer,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"image_url" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roommate_group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer,
	"tenant_id" integer,
	"is_primary" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roommate_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"document_type" text NOT NULL,
	"document_url" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verified_by" integer,
	"verified_at" timestamp,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verification_date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"activity_type" text NOT NULL,
	"metadata" json,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_tenant_id_tenant_profiles_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_landlord_id_landlord_profiles_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlord_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlord_profiles" ADD CONSTRAINT "landlord_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlord_id_landlord_profiles_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlord_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_cards" ADD CONSTRAINT "rent_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screening_pages" ADD CONSTRAINT "screening_pages_landlord_id_landlord_profiles_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."landlord_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_tenant_id_tenant_profiles_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_profiles" ADD CONSTRAINT "tenant_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_applications" ADD CONSTRAINT "group_applications_group_id_roommate_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roommate_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_applications" ADD CONSTRAINT "group_applications_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhood_insights" ADD CONSTRAINT "neighborhood_insights_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_analytics" ADD CONSTRAINT "property_analytics_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_group_members" ADD CONSTRAINT "roommate_group_members_group_id_roommate_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."roommate_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roommate_group_members" ADD CONSTRAINT "roommate_group_members_tenant_id_tenant_profiles_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_documents" ADD CONSTRAINT "tenant_documents_tenant_id_tenant_profiles_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_documents" ADD CONSTRAINT "tenant_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_references" ADD CONSTRAINT "tenant_references_tenant_id_tenant_profiles_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;