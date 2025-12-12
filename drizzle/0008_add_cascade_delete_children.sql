-- Add cascade delete to parent_child_relation when child is deleted
ALTER TABLE "daycare_parent_child_relation" DROP CONSTRAINT "daycare_parent_child_relation_childId_daycare_child_id_fk";
ALTER TABLE "daycare_parent_child_relation" ADD CONSTRAINT "daycare_parent_child_relation_childId_daycare_child_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."daycare_child"("id") ON DELETE cascade ON UPDATE no action;

-- Add cascade delete to visits when child is deleted
ALTER TABLE "daycare_visit" DROP CONSTRAINT "daycare_visit_childId_daycare_child_id_fk";
ALTER TABLE "daycare_visit" ADD CONSTRAINT "daycare_visit_childId_daycare_child_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."daycare_child"("id") ON DELETE cascade ON UPDATE no action;
