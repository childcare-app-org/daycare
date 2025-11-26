import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { validateHospitalAccessCode } from '~/lib/access-code';
import {
    createTRPCRouter, nurseProcedure, parentProcedure, protectedProcedure
} from '~/server/api/trpc';
import {
    children, hospitals, logs, nurses, parentChildRelations, parents, visits
} from '~/server/db/schema';

export const visitRouter = createTRPCRouter({
  // Create a new visit (for parents, nurses, and admins)
  create: protectedProcedure
    .input(
      z.object({
        childId: z.string().min(1, "Child ID is required"),
        hospitalId: z.string().min(1, "Hospital ID is required"),
        dropOffTime: z.date(),
        pickupTime: z.date(),
        notes: z.string().optional(),
        accessCode: z
          .string()
          .length(4, "Access code must be 4 digits")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let parentId: string;

      // Role-based logic for determining parent ID and permissions
      if (ctx.session.user.role === "parent") {
        // Parents create visits for their own children
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

        parentId = parent.id;

        // Parents must provide access code
        if (!input.accessCode) {
          throw new Error("Access code is required");
        }
      } else if (
        ctx.session.user.role === "nurse" ||
        ctx.session.user.role === "admin"
      ) {
        // Nurses/admins can create visits for any child
        const [child] = await ctx.db
          .select({
            parentId: parentChildRelations.parentId,
          })
          .from(children)
          .innerJoin(
            parentChildRelations,
            eq(children.id, parentChildRelations.childId),
          )
          .where(eq(children.id, input.childId))
          .limit(1);

        if (!child) {
          throw new Error("Child not found");
        }

        parentId = child.parentId;
        // Nurses and admins don't need access code
      } else {
        throw new Error("Unauthorized: Invalid role for creating visits");
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

      // Validate access code (only for parents)
      if (ctx.session.user.role === "parent") {
        if (
          !validateHospitalAccessCode(
            input.accessCode!,
            hospital.id,
            hospital.latitude,
            hospital.longitude,
          )
        ) {
          throw new Error("Invalid access code");
        }
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
          parentId: parentId,
          childId: input.childId,
          hospitalId: input.hospitalId,
          dropOffTime: input.dropOffTime,
          pickupTime: input.pickupTime,
          status: "active",
          notes: input.notes || null,
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
        healthCheck: visits.healthCheck,
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
          birthdate: children.birthdate,
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

  // Get today's completed visits (Nurse only)
  getMyHospitalTodaysCompletedVisits: nurseProcedure.query(async ({ ctx }) => {
    // Get the nurse record for the current user
    const [nurse] = await ctx.db
      .select()
      .from(nurses)
      .where(eq(nurses.userId, ctx.session.user.id))
      .limit(1);

    if (!nurse) {
      throw new Error("Nurse profile not found");
    }

    // Get start and end of today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get completed visits for today
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
        healthCheck: visits.healthCheck,
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
          birthdate: children.birthdate,
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
          eq(visits.status, "completed"),
          gte(visits.updatedAt, today),
          lte(visits.updatedAt, tomorrow),
        ),
      )
      .orderBy(visits.updatedAt);
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
          healthCheck: visits.healthCheck,
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
            birthdate: children.birthdate,
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
        healthCheck: visits.healthCheck,
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
          birthdate: children.birthdate,
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

  // Get visit by ID (Parent only - for parent visit detail page)
  getByIdForParent: parentProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the parent record for the current user
      const [parent] = await ctx.db
        .select()
        .from(parents)
        .where(eq(parents.userId, ctx.session.user.id))
        .limit(1);

      if (!parent) {
        throw new Error("Parent profile not found");
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
          healthCheck: visits.healthCheck,
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
            birthdate: children.birthdate,
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
        .where(and(eq(visits.id, input.id), eq(visits.parentId, parent.id)))
        .limit(1);

      if (!visit) {
        throw new Error("Visit not found or does not belong to you");
      }

      // Get logs for this visit, ordered by timestamp
      const visitLogs = await ctx.db
        .select({
          id: logs.id,
          timestamp: logs.timestamp,
          eventType: logs.eventType,
          eventData: logs.eventData,
          notes: logs.notes,
          customMemo: logs.customMemo,
          nurse: {
            name: nurses.name,
          },
        })
        .from(logs)
        .leftJoin(nurses, eq(logs.nurseId, nurses.id))
        .where(eq(logs.visitId, input.id))
        .orderBy(desc(logs.timestamp));

      return {
        ...visit,
        logs: visitLogs,
      };
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
        healthCheck: z.record(z.string(), z.any()).optional(),
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
      if (input.healthCheck !== undefined)
        updateData.healthCheck = input.healthCheck;

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
