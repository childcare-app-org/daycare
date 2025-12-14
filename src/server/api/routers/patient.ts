import { and, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  nurseProcedure,
  parentProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  children,
  parentChildRelations,
  parents,
  users,
} from "~/server/db/schema";

export const patientRouter = createTRPCRouter({
  // Search children by name (for nurses)
  searchChildren: nurseProcedure
    .input(
      z.object({
        query: z.string().min(2, "Search query must be at least 2 characters"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const childrenResults = await ctx.db
        .select({
          id: children.id,
          name: children.name,
          pronunciation: children.pronunciation,
          gender: children.gender,
          birthdate: children.birthdate,
          imageUrl: children.imageUrl,
          parentId: parentChildRelations.parentId,
          parentName: parents.name,
          parentPhone: parents.phoneNumber,
        })
        .from(children)
        .innerJoin(
          parentChildRelations,
          eq(children.id, parentChildRelations.childId),
        )
        .innerJoin(parents, eq(parentChildRelations.parentId, parents.id))
        .where(ilike(children.name, `%${input.query}%`))
        .limit(10);

      return childrenResults.map((child) => ({
        id: child.id,
        name: child.name,
        pronunciation: child.pronunciation,
        gender: child.gender,
        birthdate: child.birthdate,
        parentId: child.parentId,
        parentName: child.parentName,
        parentPhone: child.parentPhone,
      }));
    }),

  // Search parents by phone number only (for nurses)
  // Strips non-digit characters from both stored phone numbers and search query for flexible matching
  searchParents: nurseProcedure
    .input(
      z.object({
        query: z.string().min(2, "Search query must be at least 2 characters"),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Remove all non-digit characters from search query
      const digitsOnlyQuery = input.query.replace(/\D/g, "");
      const searchPattern = `%${digitsOnlyQuery}%`;

      const parentResults = await ctx.db
        .select({
          id: parents.id,
          name: parents.name,
          phoneNumber: parents.phoneNumber,
          homeAddress: parents.homeAddress,
        })
        .from(parents)
        .where(
          sql`regexp_replace(${parents.phoneNumber}, '[^0-9]', '', 'g') LIKE ${searchPattern}`,
        )
        .limit(10);

      return parentResults;
    }),

  // Create parent (for nurses or admins)
  createParent: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Parent name is required"),
        email: z.string().email("Valid email is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        homeAddress: z.string().min(1, "Home address is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only nurses and admins can create parents
      if (
        ctx.session.user.role !== "nurse" &&
        ctx.session.user.role !== "admin"
      ) {
        throw new Error(
          "Unauthorized: Only nurses and admins can create parents",
        );
      }

      // Check if parent with same email already exists
      const [existingParent] = await ctx.db
        .select()
        .from(parents)
        .where(eq(parents.email, input.email))
        .limit(1);

      if (existingParent) {
        throw new Error("A parent with this email already exists");
      }

      // Create parent record (userId will be linked when parent signs in)
      const [newParent] = await ctx.db
        .insert(parents)
        .values({
          name: input.name,
          email: input.email,
          phoneNumber: input.phoneNumber,
          homeAddress: input.homeAddress,
          userId: null, // Will be linked on first sign-in via auth callback
        })
        .returning();

      return {
        id: newParent!.id,
        name: newParent!.name,
        email: newParent!.email,
        phoneNumber: newParent!.phoneNumber,
        homeAddress: newParent!.homeAddress,
      };
    }),

  // Create child (for nurses, admins, or parents)
  createChild: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Child name is required"),
        pronunciation: z.string().optional(),
        gender: z.enum(["Male", "Female"]),
        birthdate: z.date(),
        allergies: z.string().optional(),
        preexistingConditions: z.string().optional(),
        familyDoctorName: z.string().optional(),
        familyDoctorPhone: z.string().optional(),
        imageUrl: z.string().url().optional().or(z.literal("")), // S3/CDN image URL
        parentId: z.string().optional(), // Optional for parents (auto-determined)
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let targetParentId: string;

      // Determine parent ID based on role
      if (ctx.session.user.role === "parent") {
        // Parents create children for themselves
        const [parentProfile] = await ctx.db
          .select()
          .from(parents)
          .where(eq(parents.userId, ctx.session.user.id))
          .limit(1);

        if (!parentProfile) {
          throw new Error("Parent profile not found");
        }

        targetParentId = parentProfile.id;
      } else if (
        ctx.session.user.role === "nurse" ||
        ctx.session.user.role === "admin"
      ) {
        // Nurses/admins must provide parentId
        if (!input.parentId) {
          throw new Error("Parent ID is required for nurses and admins");
        }

        // Verify parent exists
        const [parent] = await ctx.db
          .select()
          .from(parents)
          .where(eq(parents.id, input.parentId))
          .limit(1);

        if (!parent) {
          throw new Error("Parent not found");
        }

        targetParentId = input.parentId;
      } else {
        throw new Error("Unauthorized: Invalid role for creating children");
      }

      // Create the child
      const [newChild] = await ctx.db
        .insert(children)
        .values({
          name: input.name,
          pronunciation: input.pronunciation || null,
          gender: input.gender,
          birthdate: input.birthdate,
          allergies: input.allergies || null,
          preexistingConditions: input.preexistingConditions || null,
          familyDoctorName: input.familyDoctorName || null,
          familyDoctorPhone: input.familyDoctorPhone || null,
          imageUrl: input.imageUrl || null,
        })
        .returning();

      // Create parent-child relationship
      await ctx.db.insert(parentChildRelations).values({
        parentId: targetParentId,
        childId: newChild!.id,
        relationshipType: "Parent", // Default relationship type
      });

      return {
        id: newChild!.id,
        name: newChild!.name,
        birthdate: newChild!.birthdate,
        parentId: targetParentId,
      };
    }),

  // Update parent profile (Parent only)
  // Parent profile is auto-created on sign-up, this updates it with details
  updateParent: parentProcedure
    .input(
      z.object({
        name: z.string().min(1, "Parent name is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        homeAddress: z.string().min(1, "Home address is required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
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
          latitude: input.latitude?.toString(),
          longitude: input.longitude?.toString(),
        })
        .where(eq(parents.id, parent.id))
        .returning();

      return updatedParent;
    }),

  // Get parent profile (Parent only)
  getMyProfile: parentProcedure.query(async ({ ctx }) => {
    // Get the parent record for the current user
    const [parent] = await ctx.db
      .select()
      .from(parents)
      .where(eq(parents.userId, ctx.session.user.id))
      .limit(1);

    if (!parent) {
      throw new Error("Parent profile not found");
    }

    return parent;
  }),

  // Get children by parent ID (for nurses/admins)
  getChildrenByParentId: protectedProcedure
    .input(
      z.object({
        parentId: z.string().min(1, "Parent ID is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Only nurses and admins can use this
      if (
        ctx.session.user.role !== "nurse" &&
        ctx.session.user.role !== "admin"
      ) {
        throw new Error(
          "Unauthorized: Only nurses and admins can access this endpoint",
        );
      }

      // Get all children for this parent
      return await ctx.db
        .select({
          id: children.id,
          name: children.name,
          pronunciation: children.pronunciation,
          gender: children.gender,
          birthdate: children.birthdate,
          allergies: children.allergies,
          preexistingConditions: children.preexistingConditions,
          familyDoctorName: children.familyDoctorName,
          familyDoctorPhone: children.familyDoctorPhone,
          imageUrl: children.imageUrl,
          parentId: parentChildRelations.parentId,
        })
        .from(parentChildRelations)
        .innerJoin(children, eq(parentChildRelations.childId, children.id))
        .where(eq(parentChildRelations.parentId, input.parentId));
    }),

  // Get parent's children (Parent only)
  getMyChildren: parentProcedure.query(async ({ ctx }) => {
    // Get the parent record for the current user
    const [parent] = await ctx.db
      .select()
      .from(parents)
      .where(eq(parents.userId, ctx.session.user.id))
      .limit(1);

    if (!parent) {
      throw new Error("Parent profile not found");
    }

    // Get all children for this parent
    return await ctx.db
      .select({
        id: children.id,
        name: children.name,
        pronunciation: children.pronunciation,
        gender: children.gender,
        birthdate: children.birthdate,
        allergies: children.allergies,
        preexistingConditions: children.preexistingConditions,
        familyDoctorName: children.familyDoctorName,
        familyDoctorPhone: children.familyDoctorPhone,
        imageUrl: children.imageUrl,
        createdAt: children.createdAt,
      })
      .from(parentChildRelations)
      .leftJoin(children, eq(parentChildRelations.childId, children.id))
      .where(eq(parentChildRelations.parentId, parent.id));
  }),

  // Update child (Parent, Nurse, Admin)
  updateChild: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Child ID is required"),
        name: z.string().min(1, "Child name is required"),
        pronunciation: z.string().optional(),
        gender: z.enum(["Male", "Female"]),
        birthdate: z.date(),
        allergies: z.string().optional(),
        preexistingConditions: z.string().optional(),
        familyDoctorName: z.string().optional(),
        familyDoctorPhone: z.string().optional(),
        imageUrl: z.string().url().optional().or(z.literal("")), // S3/CDN image URL
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If user is a parent, verify they own the child
      if (ctx.session.user.role === "parent") {
        const [parent] = await ctx.db
          .select()
          .from(parents)
          .where(eq(parents.userId, ctx.session.user.id))
          .limit(1);

        if (!parent) {
          throw new Error("Parent profile not found");
        }

        // Verify the child belongs to this parent
        const [relation] = await ctx.db
          .select()
          .from(parentChildRelations)
          .where(
            and(
              eq(parentChildRelations.parentId, parent.id),
              eq(parentChildRelations.childId, input.id),
            ),
          )
          .limit(1);

        if (!relation) {
          throw new Error("Child not found or does not belong to this parent");
        }
      } else if (
        ctx.session.user.role !== "nurse" &&
        ctx.session.user.role !== "admin"
      ) {
        throw new Error("Unauthorized");
      }

      // Perform the update
      const [child] = await ctx.db
        .update(children)
        .set({
          name: input.name,
          pronunciation: input.pronunciation || null,
          gender: input.gender,
          birthdate: input.birthdate,
          allergies: input.allergies,
          preexistingConditions: input.preexistingConditions,
          familyDoctorName: input.familyDoctorName,
          familyDoctorPhone: input.familyDoctorPhone,
          imageUrl: input.imageUrl || null,
        })
        .where(eq(children.id, input.id))
        .returning();

      if (!child) {
        throw new Error("Failed to update child");
      }

      return child;
    }),

  // Delete child (Parent only)
  deleteChild: parentProcedure
    .input(z.object({ id: z.string() }))
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

      // Verify the child belongs to this parent
      const [relation] = await ctx.db
        .select()
        .from(parentChildRelations)
        .where(
          and(
            eq(parentChildRelations.parentId, parent.id),
            eq(parentChildRelations.childId, input.id),
          ),
        )
        .limit(1);

      if (!relation) {
        throw new Error("Child not found or does not belong to this parent");
      }

      // Delete the child (cascade will handle relations)
      const [child] = await ctx.db
        .delete(children)
        .where(eq(children.id, input.id))
        .returning();

      if (!child) {
        throw new Error("Failed to delete child");
      }

      return child;
    }),
});
