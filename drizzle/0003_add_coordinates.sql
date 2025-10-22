-- Add latitude and longitude to hospitals table
ALTER TABLE "daycare_hospital" ADD COLUMN "latitude" numeric(10, 7);
ALTER TABLE "daycare_hospital" ADD COLUMN "longitude" numeric(10, 7);

-- Add latitude and longitude to parents table
ALTER TABLE "daycare_parent" ADD COLUMN "latitude" numeric(10, 7);
ALTER TABLE "daycare_parent" ADD COLUMN "longitude" numeric(10, 7);

