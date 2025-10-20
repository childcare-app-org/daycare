import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, parentProcedure, protectedProcedure } from '~/server/api/trpc';
import { children, parentChildRelations, parents, users } from '~/server/db/schema';

export const patientRouter = createTRPCRouter({
  // Update parent profile (Parent only)
  // Parent profile is auto-created on sign-up, this updates it with details
  updateParent: parentProcedure
    .input(
      z.object({
        name: z.string().min(1, "Parent name is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        homeAddress: z.string().min(1, "Home address is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the parent record for the current user
      const [parent] = await ctx.db
        .select()
        .from(parents)
        .where(eq(parents.userId, ctx.session.user.id))
        .limit(1);

      if (!parent) {
        throw new Error("Parent profile not found");
      }

      // Update the parent profile
      const [updatedParent] = await ctx.db
        .update(parents)
        .set({
          name: input.name,
          phoneNumber: input.phoneNumber,
          homeAddress: input.homeAddress,
        })
        .where(eq(parents.id, parent.id))
        .returning();

      return updatedParent;
    }),

  // Create child profile (Parent only)
  // Parents can create profiles for their children
  createChild: parentProcedure
    .input(
      z.object({
        name: z.string().min(1, "Child name is required"),
        age: z
          .number()
          .int()
          .min(3, "Age must be at least 3 months")
          .max(144, "Age must be at most 144 months"),
        allergies: z.string().optional(),
        preexistingConditions: z.string().optional(),
        familyDoctorName: z.string().optional(),
        familyDoctorPhone: z.string().optional(),
        relationshipType: z
          .string()
          .min(1, "Relationship type is required")
          .default("Parent"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the parent record for the current user
      const [parent] = await ctx.db
        .select()
        .from(parents)
        .where(eq(parents.userId, ctx.session.user.id))
        .limit(1);

      if (!parent) {
        throw new Error(
          "Parent profile not found. Please create a parent profile first.",
        );
      }

      // Create the child
      const [child] = await ctx.db
        .insert(children)
        .values({
          name: input.name,
          age: input.age,
          allergies: input.allergies,
          preexistingConditions: input.preexistingConditions,
          familyDoctorName: input.familyDoctorName,
          familyDoctorPhone: input.familyDoctorPhone,
        })
        .returning();

      if (!child) {
        throw new Error("Failed to create child");
      }

      // Create parent-child relationship
      await ctx.db.insert(parentChildRelations).values({
        parentId: parent.id,
        childId: child.id,
        relationshipType: input.relationshipType,
      });

      return child;
    }),
});
