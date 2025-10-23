-- Add cascade delete to logs table when visit is deleted
ALTER TABLE "daycare_log" DROP CONSTRAINT "daycare_log_visitId_daycare_visit_id_fk";
ALTER TABLE "daycare_log" ADD CONSTRAINT "daycare_log_visitId_daycare_visit_id_fk" FOREIGN KEY ("visitId") REFERENCES "public"."daycare_visit"("id") ON DELETE cascade ON UPDATE no action;
