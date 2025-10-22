import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createTRPCRouter, nurseProcedure, parentProcedure } from '~/server/api/trpc';
import {
    children, hospitals, nurses, parentChildRelations, parents, visits
} from '~/server/db/schema';

export const visitRouter = createTRPCRouter({
  // Create a new visit (Parent only)
  // Parents create a visit when they drop off their child at a hospital
  create: parentProcedure
    .input(
      z.object({
        childId: z.string().min(1, "Child ID is required"),
        hospitalId: z.string().min(1, "Hospital ID is required"),
        dropOffTime: z.date(),
        notes: z.string().optional(),
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

      // Verify the child belongs to this parent
      const [relation] = await ctx.db
        .select()
        .from(parentChildRelations)
        .where(
          and(
            eq(parentChildRelations.parentId, parent.id),
            eq(parentChildRelations.childId, input.childId),
          ),
        )
        .limit(1);

      if (!relation) {
        throw new Error("Child not found or does not belong to this parent");
      }

      // Verify hospital exists
      const [hospital] = await ctx.db
        .select()
        .from(hospitals)
        .where(eq(hospitals.id, input.hospitalId))
        .limit(1);

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      // Check if child already has an active visit
      const [activeVisit] = await ctx.db
        .select()
        .from(visits)
        .where(
          and(eq(visits.childId, input.childId), eq(visits.status, "active")),
        )
        .limit(1);

      if (activeVisit) {
        throw new Error(
          "Child already has an active visit. Please complete the previous visit first.",
        );
      }

      // Create the visit
      const [visit] = await ctx.db
        .insert(visits)
        .values({
          parentId: parent.id,
          childId: input.childId,
          hospitalId: input.hospitalId,
          dropOffTime: input.dropOffTime,
          status: "active",
          notes: input.notes,
        })
        .returning();

      return visit;
    }),

  // Get active visits for nurse's hospital (Nurse only)
  // Nurses see all active visits at their assigned hospital
  getMyHospitalActiveVisits: nurseProcedure.query(async ({ ctx }) => {
    // Get the nurse record for the current user
    const [nurse] = await ctx.db
      .select()
      .from(nurses)
      .where(eq(nurses.userId, ctx.session.user.id))
      .limit(1);

    if (!nurse) {
      throw new Error("Nurse profile not found");
    }

    // Get active visits for this hospital
    return await ctx.db
      .select({
        id: visits.id,
        parentId: visits.parentId,
        childId: visits.childId,
        hospitalId: visits.hospitalId,
        dropOffTime: visits.dropOffTime,
        pickupTime: visits.pickupTime,
        status: visits.status,
        notes: visits.notes,
        createdAt: visits.createdAt,
        updatedAt: visits.updatedAt,
        parent: {
          id: parents.id,
          name: parents.name,
          phoneNumber: parents.phoneNumber,
        },
        child: {
          id: children.id,
          name: children.name,
          age: children.age,
          allergies: children.allergies,
          preexistingConditions: children.preexistingConditions,
          familyDoctorName: children.familyDoctorName,
          familyDoctorPhone: children.familyDoctorPhone,
        },
        hospital: {
          id: hospitals.id,
          name: hospitals.name,
          address: hospitals.address,
        },
      })
      .from(visits)
      .leftJoin(parents, eq(visits.parentId, parents.id))
      .leftJoin(children, eq(visits.childId, children.id))
      .leftJoin(hospitals, eq(visits.hospitalId, hospitals.id))
      .where(
        and(
          eq(visits.hospitalId, nurse.hospitalId),
          eq(visits.status, "active"),
        ),
      );
  }),

  // Get visit by ID (Nurse only - for visit detail page)
  getById: nurseProcedure
    .input(z.object({ id: z.string() }))
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

      // Get visit details with related data
      const [visit] = await ctx.db
        .select({
          id: visits.id,
          parentId: visits.parentId,
          childId: visits.childId,
          hospitalId: visits.hospitalId,
          dropOffTime: visits.dropOffTime,
          pickupTime: visits.pickupTime,
          status: visits.status,
          notes: visits.notes,
          createdAt: visits.createdAt,
          updatedAt: visits.updatedAt,
          parent: {
            id: parents.id,
            name: parents.name,
            phoneNumber: parents.phoneNumber,
          },
          child: {
            id: children.id,
            name: children.name,
            age: children.age,
            allergies: children.allergies,
            preexistingConditions: children.preexistingConditions,
            familyDoctorName: children.familyDoctorName,
            familyDoctorPhone: children.familyDoctorPhone,
          },
          hospital: {
            id: hospitals.id,
            name: hospitals.name,
            address: hospitals.address,
          },
        })
        .from(visits)
        .leftJoin(parents, eq(visits.parentId, parents.id))
        .leftJoin(children, eq(visits.childId, children.id))
        .leftJoin(hospitals, eq(visits.hospitalId, hospitals.id))
        .where(
          and(eq(visits.id, input.id), eq(visits.hospitalId, nurse.hospitalId)),
        )
        .limit(1);

      if (!visit) {
        throw new Error("Visit not found or not in your hospital");
      }

      return visit;
    }),

  // Get parent's children's active visits (Parent only)
  // Parents see active visits for their children
  getMyChildrenActiveVisits: parentProcedure.query(async ({ ctx }) => {
    // Get the parent record for the current user
    const [parent] = await ctx.db
      .select()
      .from(parents)
      .where(eq(parents.userId, ctx.session.user.id))
      .limit(1);

    if (!parent) {
      throw new Error("Parent profile not found");
    }

    // Get active visits for this parent's children
    return await ctx.db
      .select({
        id: visits.id,
        parentId: visits.parentId,
        childId: visits.childId,
        hospitalId: visits.hospitalId,
        dropOffTime: visits.dropOffTime,
        pickupTime: visits.pickupTime,
        status: visits.status,
        notes: visits.notes,
        createdAt: visits.createdAt,
        updatedAt: visits.updatedAt,
        parent: {
          id: parents.id,
          name: parents.name,
          phoneNumber: parents.phoneNumber,
        },
        child: {
          id: children.id,
          name: children.name,
          age: children.age,
          allergies: children.allergies,
          preexistingConditions: children.preexistingConditions,
          familyDoctorName: children.familyDoctorName,
          familyDoctorPhone: children.familyDoctorPhone,
        },
        hospital: {
          id: hospitals.id,
          name: hospitals.name,
          address: hospitals.address,
        },
      })
      .from(visits)
      .leftJoin(parents, eq(visits.parentId, parents.id))
      .leftJoin(children, eq(visits.childId, children.id))
      .leftJoin(hospitals, eq(visits.hospitalId, hospitals.id))
      .where(and(eq(visits.parentId, parent.id), eq(visits.status, "active")));
  }),

  // Update visit (Nurse only)
  update: nurseProcedure
    .input(
      z.object({
        id: z.string().min(1, "Visit ID is required"),
        dropOffTime: z.date().optional(),
        pickupTime: z.date().optional(),
        status: z.enum(["active", "completed", "cancelled"]).optional(),
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

      // Check if visit exists and belongs to nurse's hospital
      const [existingVisit] = await ctx.db
        .select()
        .from(visits)
        .where(eq(visits.id, input.id))
        .limit(1);

      if (!existingVisit) {
        throw new Error("Visit not found");
      }

      if (existingVisit.hospitalId !== nurse.hospitalId) {
        throw new Error("Visit does not belong to your hospital");
      }

      const updateData: Record<string, unknown> = {};
      if (input.dropOffTime !== undefined)
        updateData.dropOffTime = input.dropOffTime;
      if (input.pickupTime !== undefined)
        updateData.pickupTime = input.pickupTime;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.notes !== undefined) updateData.notes = input.notes;

      const [visit] = await ctx.db
        .update(visits)
        .set(updateData)
        .where(eq(visits.id, input.id))
        .returning();

      if (!visit) {
        throw new Error("Failed to update visit");
      }

      return visit;
    }),

  // Delete visit (Nurse only)
  delete: nurseProcedure
    .input(z.object({ id: z.string() }))
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

      // Check if visit exists and belongs to nurse's hospital
      const [existingVisit] = await ctx.db
        .select()
        .from(visits)
        .where(eq(visits.id, input.id))
        .limit(1);

      if (!existingVisit) {
        throw new Error("Visit not found");
      }

      if (existingVisit.hospitalId !== nurse.hospitalId) {
        throw new Error("Visit does not belong to your hospital");
      }

      const [visit] = await ctx.db
        .delete(visits)
        .where(eq(visits.id, input.id))
        .returning();

      if (!visit) {
        throw new Error("Failed to delete visit");
      }

      return visit;
    }),
});
