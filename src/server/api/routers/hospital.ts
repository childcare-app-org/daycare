import { z } from 'zod';
import { adminProcedure, createTRPCRouter } from '~/server/api/trpc';
import { hospitals } from '~/server/db/schema';

export const hospitalRouter = createTRPCRouter({
  // Create a new hospital (Admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Hospital name is required"),
        address: z.string().min(1, "Address is required"),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        pricing: z.number().min(0, "Pricing must be non-negative"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [hospital] = await ctx.db
        .insert(hospitals)
        .values({
          name: input.name,
          address: input.address,
          capacity: input.capacity,
          pricing: input.pricing.toString(), // Drizzle stores numeric as string
        })
        .returning();

      return hospital;
    }),
});
