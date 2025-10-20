import { eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { users } from '~/server/db/schema';

export const userRouter = createTRPCRouter({
  // Get current user's profile
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, ctx.session.user.id));

    return user;
  }),
});
