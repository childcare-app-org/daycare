import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, nurseProcedure } from '~/server/api/trpc';
import { hospitals, nurses, users } from '~/server/db/schema';

export const nurseRouter = createTRPCRouter({
  // Get nurse profile (Nurse only)
  getMyProfile: nurseProcedure.query(async ({ ctx }) => {
    const [nurse] = await ctx.db
      .select({
        id: nurses.id,
        name: nurses.name,
        hospitalId: nurses.hospitalId,
        hospitalName: hospitals.name,
      })
      .from(nurses)
      .innerJoin(hospitals, eq(nurses.hospitalId, hospitals.id))
      .where(eq(nurses.userId, ctx.session.user.id))
      .limit(1);

    if (!nurse) {
      throw new Error("Nurse profile not found");
    }

    return nurse;
  }),

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

  // Get nurses by hospital (Admin only)
  getByHospital: adminProcedure
    .input(z.object({ hospitalId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: nurses.id,
          name: nurses.name,
          email: nurses.email,
          hospitalId: nurses.hospitalId,
          userId: nurses.userId,
          createdAt: nurses.createdAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(nurses)
        .leftJoin(users, eq(nurses.userId, users.id))
        .where(eq(nurses.hospitalId, input.hospitalId));
    }),

  // Update nurse (Admin only)
  // Can only edit name and email if nurse is inactive (userId is null)
  // Hospital assignment is permanent and cannot be changed
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1, "Nurse ID is required"),
        name: z.string().min(1, "Nurse name is required"),
        email: z.string().email("Valid email is required").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if nurse exists and get current state
      const [existingNurse] = await ctx.db
        .select()
        .from(nurses)
        .where(eq(nurses.id, input.id))
        .limit(1);

      if (!existingNurse) {
        throw new Error("Nurse not found");
      }

      // If nurse is active (has userId), cannot change email
      if (
        existingNurse.userId &&
        input.email &&
        input.email !== existingNurse.email
      ) {
        throw new Error("Cannot change email for active nurse");
      }

      // If email is being changed, check if it's already in use
      if (input.email && input.email !== existingNurse.email) {
        const [emailInUse] = await ctx.db
          .select()
          .from(nurses)
          .where(eq(nurses.email, input.email))
          .limit(1);

        if (emailInUse) {
          throw new Error("A nurse with this email already exists");
        }
      }

      const updateData: Record<string, string> = {
        name: input.name,
      };

      // Only update email if provided and nurse is inactive
      if (input.email && !existingNurse.userId) {
        updateData.email = input.email;
      }

      const [nurse] = await ctx.db
        .update(nurses)
        .set(updateData)
        .where(eq(nurses.id, input.id))
        .returning();

      if (!nurse) {
        throw new Error("Failed to update nurse");
      }

      return nurse;
    }),

  // Delete nurse (Admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [nurse] = await ctx.db
        .delete(nurses)
        .where(eq(nurses.id, input.id))
        .returning();

      if (!nurse) {
        throw new Error("Nurse not found");
      }

      return nurse;
    }),
});
