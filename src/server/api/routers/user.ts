import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  // Get current user's profile
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, ctx.session.user.id));

    return user;
  }),

  // Update current user's profile
  updateMe: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        image: z.string().url("Invalid image URL").optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: { name?: string; image?: string | null } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.image !== undefined) {
        updateData.image = input.image;
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.session.user.id))
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update user profile");
      }

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
      };
    }),
});
