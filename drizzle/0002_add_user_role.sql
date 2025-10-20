-- Add role column to users table
ALTER TABLE "daycare_user" ADD COLUMN "role" varchar(50) DEFAULT 'admin';

