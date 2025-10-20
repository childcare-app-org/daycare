import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter } from '~/server/api/trpc';
import { hospitals, nurses } from '~/server/db/schema';

export const nurseRouter = createTRPCRouter({
  // Create a new nurse entry (Admin only)
  // Admin creates a nurse with their email. When that user signs in, they'll be automatically linked
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nurse name is required"),
        email: z.string().email("Valid email is required"),
        hospitalId: z.string().min(1, "Hospital ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if hospital exists
      const [hospitalExists] = await ctx.db
        .select()
        .from(hospitals)
        .where(eq(hospitals.id, input.hospitalId))
        .limit(1);

      if (!hospitalExists) {
        throw new Error("Hospital not found");
      }

      // Check if email is already registered as a nurse
      const [existingNurse] = await ctx.db
        .select()
        .from(nurses)
        .where(eq(nurses.email, input.email))
        .limit(1);

      if (existingNurse) {
        throw new Error("A nurse with this email already exists");
      }

      const [nurse] = await ctx.db
        .insert(nurses)
        .values({
          name: input.name,
          email: input.email,
          hospitalId: input.hospitalId,
        })
        .returning();

      if (!nurse) {
        throw new Error("Failed to create nurse");
      }

      return {
        id: nurse.id,
        name: nurse.name,
        email: nurse.email,
        hospitalId: nurse.hospitalId,
      };
    }),
});
