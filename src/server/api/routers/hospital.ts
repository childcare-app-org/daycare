import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { hospitals } from '~/server/db/schema';

export const hospitalRouter = createTRPCRouter({
  // Create a new hospital (Admin only)
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Hospital name is required"),
        address: z.string().min(1, "Address is required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        pricing: z.number().min(0, "Pricing must be non-negative"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      const [hospital] = await ctx.db
        .insert(hospitals)
        .values({
          name: input.name,
          address: input.address,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          capacity: input.capacity,
          pricing: input.pricing.toString(), // Drizzle stores numeric as string
        })
        .returning();

      return hospital;
    }),

  // Get all hospitals (Admin only)
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(hospitals);
  }),

  // Get all hospitals for public viewing (e.g., parents selecting a hospital)
  getAllPublic: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: hospitals.id,
        name: hospitals.name,
        address: hospitals.address,
        latitude: hospitals.latitude,
        longitude: hospitals.longitude,
        pricing: hospitals.pricing,
        capacity: hospitals.capacity,
      })
      .from(hospitals);
  }),

  // Get hospital by ID (Admin only)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [hospital] = await ctx.db
        .select()
        .from(hospitals)
        .where(eq(hospitals.id, input.id));

      return hospital;
    }),

  // Update hospital (Admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1, "Hospital ID is required"),
        name: z.string().min(1, "Hospital name is required"),
        address: z.string().min(1, "Address is required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        pricing: z.number().min(0, "Pricing must be non-negative"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [hospital] = await ctx.db
        .update(hospitals)
        .set({
          name: input.name,
          address: input.address,
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
          capacity: input.capacity,
          pricing: input.pricing.toString(),
        })
        .where(eq(hospitals.id, input.id))
        .returning();

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      return hospital;
    }),

  // Delete hospital (Admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [hospital] = await ctx.db
        .delete(hospitals)
        .where(eq(hospitals.id, input.id))
        .returning();

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      return hospital;
    }),
});
