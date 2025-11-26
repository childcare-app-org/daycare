-- Replace age column with birthdate in children table
ALTER TABLE "daycare_child" 
  ADD COLUMN "birthdate" timestamp with time zone;

-- Migrate existing age data to birthdate (assuming age is in months)
-- Calculate approximate birthdate by subtracting age months from current date
UPDATE "daycare_child" 
SET "birthdate" = CURRENT_TIMESTAMP - (age || ' months')::interval
WHERE age IS NOT NULL;

-- Make birthdate NOT NULL after migration
ALTER TABLE "daycare_child" 
  ALTER COLUMN "birthdate" SET NOT NULL;

-- Drop the age column
ALTER TABLE "daycare_child" 
  DROP COLUMN "age";

