-- Add pronunciation and gender fields to children table
ALTER TABLE "daycare_child" 
  ADD COLUMN "pronunciation" text;

ALTER TABLE "daycare_child" 
  ADD COLUMN "gender" varchar(20);
