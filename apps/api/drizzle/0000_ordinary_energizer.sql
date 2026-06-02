CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"password_hash" text,
	"image" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
