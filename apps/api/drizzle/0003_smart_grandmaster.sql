CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"theme" "theme" DEFAULT 'system' NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;