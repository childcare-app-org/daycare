import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { parents, passwordResetTokens, users } from "~/server/db/schema";

import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  // Register a new user with email/password
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().min(1, "Name is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const [existingUser] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: "parent", // Default to parent role
        })
        .returning();

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Create parent record for the new user
      await ctx.db.insert(parents).values({
        userId: newUser.id,
        name: input.name,
        email: input.email,
        phoneNumber: "",
        homeAddress: "",
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
    }),

  // Request password reset (generates and stores reset token)
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      // Don't reveal if user exists or not (security best practice)
      if (!user || !user.password) {
        // Return success even if user doesn't exist to prevent email enumeration
        return { success: true };
      }

      // Generate secure random token
      const token = crypto.randomUUID() + crypto.randomUUID();

      // Set expiration to 1 hour from now
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      // Delete any existing tokens for this user
      await ctx.db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      // Store new token
      await ctx.db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expires,
      });

      // TODO: Send email with reset link
      // In production, you would send an email with a link like:
      // `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${input.email}`

      // For now, return the token in development (remove this in production!)
      if (process.env.NODE_ENV === "development") {
        return {
          success: true,
          token, // Only return token in development for testing
          resetUrl: `/auth/reset-password?token=${token}&email=${encodeURIComponent(input.email)}`,
        };
      }

      return { success: true };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        token: z.string().min(1, "Token is required"),
        newPassword: z
          .string()
          .min(6, "Password must be at least 6 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Find valid reset token
      const [resetToken] = await ctx.db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.userId, user.id),
            eq(passwordResetTokens.token, input.token),
            gt(passwordResetTokens.expires, new Date()),
          ),
        )
        .limit(1);

      if (!resetToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Update password
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      // Delete the used token
      await ctx.db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return { success: true };
    }),

  // Change password (for authenticated users)
  changePassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
          .string()
          .min(6, "Password must be at least 6 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find user
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user || !user.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        input.currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Update password
      await ctx.db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));

      return { success: true };
    }),
});
