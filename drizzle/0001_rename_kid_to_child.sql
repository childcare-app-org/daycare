-- Rename kid table to child
ALTER TABLE "daycare_kid" RENAME TO "daycare_child";

-- Rename parent_kid_relation table to parent_child_relation
ALTER TABLE "daycare_parent_kid_relation" RENAME TO "daycare_parent_child_relation";

-- Rename kidId column to childId in parent_child_relation table
ALTER TABLE "daycare_parent_child_relation" RENAME COLUMN "kidId" TO "childId";

-- Rename kidId column to childId in visit table
ALTER TABLE "daycare_visit" RENAME COLUMN "kidId" TO "childId";

-- Drop old indexes
DROP INDEX IF EXISTS "kid_name_idx";
DROP INDEX IF EXISTS "parent_kid_parent_idx";
DROP INDEX IF EXISTS "parent_kid_kid_idx";
DROP INDEX IF EXISTS "parent_kid_relationship_idx";
DROP INDEX IF EXISTS "visit_kid_idx";

-- Create new indexes with updated names
CREATE INDEX "child_name_idx" ON "daycare_child" USING btree ("name");
CREATE INDEX "parent_child_parent_idx" ON "daycare_parent_child_relation" USING btree ("parentId");
CREATE INDEX "parent_child_child_idx" ON "daycare_parent_child_relation" USING btree ("childId");
CREATE INDEX "parent_child_relationship_idx" ON "daycare_parent_child_relation" USING btree ("relationshipType");
CREATE INDEX "visit_child_idx" ON "daycare_visit" USING btree ("childId");

-- Update foreign key constraints
ALTER TABLE "daycare_parent_child_relation" DROP CONSTRAINT "daycare_parent_kid_relation_kidId_daycare_kid_id_fk";
ALTER TABLE "daycare_parent_child_relation" ADD CONSTRAINT "daycare_parent_child_relation_childId_daycare_child_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."daycare_child"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daycare_visit" DROP CONSTRAINT "daycare_visit_kidId_daycare_kid_id_fk";
ALTER TABLE "daycare_visit" ADD CONSTRAINT "daycare_visit_childId_daycare_child_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."daycare_child"("id") ON DELETE no action ON UPDATE no action;