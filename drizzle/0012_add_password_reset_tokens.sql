-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS "daycare_password_reset_token" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_token_user_idx" ON "daycare_password_reset_token" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_token_token_idx" ON "daycare_password_reset_token" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_token_expires_idx" ON "daycare_password_reset_token" ("expires");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daycare_password_reset_token" ADD CONSTRAINT "daycare_password_reset_token_userId_daycare_user_id_fk" FOREIGN KEY ("userId") REFERENCES "daycare_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
