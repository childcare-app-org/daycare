-- Add password field to users table for credentials provider
ALTER TABLE "daycare_user" ADD COLUMN "password" varchar(255);
