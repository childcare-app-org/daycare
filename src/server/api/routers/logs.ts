import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, nurseProcedure } from '~/server/api/trpc';
import { children, logs, nurses, visits } from '~/server/db/schema';

const logEventDataSchema = z
  .object({
    tags: z.array(z.string()).optional(),
    temperature: z.number().optional(),
  })
  .partial();

export const logsRouter = createTRPCRouter({
  // Create a new log entry (Nurse only)
  create: nurseProcedure
    .input(
      z.object({
        visitId: z.string().min(1, "Visit ID is required"),
        eventType: z.string().min(1, "Event type is required"),
        eventData: logEventDataSchema.optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the nurse record for the current user
      const [nurse] = await ctx.db
        .select()
        .from(nurses)
        .where(eq(nurses.userId, ctx.session.user.id))
        .limit(1);

      if (!nurse) {
        throw new Error("Nurse profile not found");
      }

      // Verify the visit exists and is active
      const [visit] = await ctx.db
        .select()
        .from(visits)
        .where(and(eq(visits.id, input.visitId), eq(visits.status, "active")))
        .limit(1);

      if (!visit) {
        throw new Error("Visit not found or not active");
      }

      // Create the log entry
      const [log] = await ctx.db
        .insert(logs)
        .values({
          visitId: input.visitId,
          nurseId: nurse.id,
          eventType: input.eventType,
          eventData: input.eventData || {},
          notes: input.notes,
        })
        .returning();

      return log;
    }),

  // Get logs for a specific visit (Nurse only)
  getByVisit: nurseProcedure
    .input(z.object({ visitId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the nurse record for the current user
      const [nurse] = await ctx.db
        .select()
        .from(nurses)
        .where(eq(nurses.userId, ctx.session.user.id))
        .limit(1);

      if (!nurse) {
        throw new Error("Nurse profile not found");
      }

      // Verify the visit exists and is in the nurse's hospital
      const [visit] = await ctx.db
        .select()
        .from(visits)
        .where(
          and(
            eq(visits.id, input.visitId),
            eq(visits.hospitalId, nurse.hospitalId),
          ),
        )
        .limit(1);

      if (!visit) {
        throw new Error("Visit not found or not in your hospital");
      }

      // Get logs for this visit, ordered by timestamp
      return await ctx.db
        .select({
          id: logs.id,
          timestamp: logs.timestamp,
          eventType: logs.eventType,
          eventData: logs.eventData,
          notes: logs.notes,
          customMemo: logs.customMemo,
          nurse: {
            name: nurses.name,
          },
        })
        .from(logs)
        .leftJoin(nurses, eq(logs.nurseId, nurses.id))
        .where(eq(logs.visitId, input.visitId))
        .orderBy(desc(logs.timestamp));
    }),
});
