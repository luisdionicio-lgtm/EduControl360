-- Constraints protect persisted invariants even outside the HTTP DTOs.
ALTER TABLE "Section" ADD CONSTRAINT "Section_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_score_range" CHECK ("score" >= 0 AND "score" <= 20);
ALTER TABLE "Course" ADD CONSTRAINT "Course_credits_range" CHECK ("credits" BETWEEN 1 AND 30);
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_weight_range" CHECK ("weight" BETWEEN 1 AND 100);
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_weekday_range" CHECK ("weekday" BETWEEN 1 AND 7);
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_time_range" CHECK ("startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' AND "endTime" > "startTime");
ALTER TABLE "Period" ADD CONSTRAINT "Period_date_range" CHECK ("endsAt" > "startsAt");
