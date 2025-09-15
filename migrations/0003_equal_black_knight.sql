CREATE TABLE "property_qr_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"qr_code_data" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scan_count" integer DEFAULT 0 NOT NULL,
	"last_scanned_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "property_qr_codes" ADD CONSTRAINT "property_qr_codes_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;