import { relations, sql } from 'drizzle-orm';
import { index, pgTableCreator, primaryKey } from 'drizzle-orm/pg-core';

import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `daycare_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  role: d.varchar({ length: 50 }).$type<"admin" | "nurse" | "parent">(), // null by default, set on first sign-in
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Hospital Daycare App Schema

export const hospitals = createTable(
  "hospital",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    address: d.text().notNull(),
    latitude: d.numeric({ precision: 10, scale: 7 }),
    longitude: d.numeric({ precision: 10, scale: 7 }),
    capacity: d.integer().notNull().default(20), // Default capacity of 20 kids
    pricing: d.numeric({ precision: 10, scale: 2 }).notNull(), // Daily cost
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("hospital_name_idx").on(t.name)],
);

export const nurses = createTable(
  "nurse",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    email: d.varchar({ length: 255 }).notNull().unique(), // Email for automatic linking
    hospitalId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => hospitals.id),
    userId: d.varchar({ length: 255 }).references(() => users.id), // Link to auth user after they sign in
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("nurse_hospital_idx").on(t.hospitalId),
    index("nurse_user_idx").on(t.userId),
    index("nurse_email_idx").on(t.email),
  ],
);

export const parents = createTable(
  "parent",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    phoneNumber: d.varchar({ length: 20 }).notNull(),
    homeAddress: d.text().notNull(),
    latitude: d.numeric({ precision: 10, scale: 7 }),
    longitude: d.numeric({ precision: 10, scale: 7 }),
    userId: d.varchar({ length: 255 }).references(() => users.id), // Link to auth user if using NextAuth
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("parent_phone_idx").on(t.phoneNumber),
    index("parent_user_idx").on(t.userId),
  ],
);

export const children = createTable(
  "child",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    age: d.integer().notNull(), // Age in months for precision
    allergies: d.text(), // JSON string or comma-separated
    preexistingConditions: d.text(), // JSON string or comma-separated
    familyDoctorName: d.varchar({ length: 255 }),
    familyDoctorPhone: d.varchar({ length: 20 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("child_name_idx").on(t.name)],
);

export const parentChildRelations = createTable(
  "parent_child_relation",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    parentId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => parents.id),
    childId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => children.id),
    relationshipType: d.varchar({ length: 50 }).notNull(), // Mother, Father, Guardian, etc.
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("parent_child_parent_idx").on(t.parentId),
    index("parent_child_child_idx").on(t.childId),
    index("parent_child_relationship_idx").on(t.relationshipType),
  ],
);

export const visits = createTable(
  "visit",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    parentId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => parents.id),
    childId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => children.id),
    hospitalId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => hospitals.id),
    dropOffTime: d.timestamp({ withTimezone: true }).notNull(),
    pickupTime: d.timestamp({ withTimezone: true }),
    status: d.varchar({ length: 20 }).notNull().default("active"), // active, completed, cancelled
    notes: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("visit_parent_idx").on(t.parentId),
    index("visit_child_idx").on(t.childId),
    index("visit_hospital_idx").on(t.hospitalId),
    index("visit_status_idx").on(t.status),
    index("visit_dropoff_idx").on(t.dropOffTime),
  ],
);

export const logs = createTable(
  "log",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    visitId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => visits.id),
    nurseId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => nurses.id),
    timestamp: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    eventType: d.varchar({ length: 50 }).notNull(), // output, input, state, temperature, general
    eventData: d.jsonb().notNull(), // Flexible JSON for different event types
    notes: d.text(),
    customMemo: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("log_visit_idx").on(t.visitId),
    index("log_nurse_idx").on(t.nurseId),
    index("log_timestamp_idx").on(t.timestamp),
    index("log_event_type_idx").on(t.eventType),
  ],
);

// Relations
export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  nurses: many(nurses),
  visits: many(visits),
}));

export const nursesRelations = relations(nurses, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [nurses.hospitalId],
    references: [hospitals.id],
  }),
  user: one(users, { fields: [nurses.userId], references: [users.id] }),
  logs: many(logs),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, { fields: [parents.userId], references: [users.id] }),
  parentChildRelations: many(parentChildRelations),
  visits: many(visits),
}));

export const childrenRelations = relations(children, ({ many }) => ({
  parentChildRelations: many(parentChildRelations),
  visits: many(visits),
}));

export const parentChildRelationsRelations = relations(
  parentChildRelations,
  ({ one }) => ({
    parent: one(parents, {
      fields: [parentChildRelations.parentId],
      references: [parents.id],
    }),
    child: one(children, {
      fields: [parentChildRelations.childId],
      references: [children.id],
    }),
  }),
);

export const visitsRelations = relations(visits, ({ one, many }) => ({
  parent: one(parents, { fields: [visits.parentId], references: [parents.id] }),
  child: one(children, { fields: [visits.childId], references: [children.id] }),
  hospital: one(hospitals, {
    fields: [visits.hospitalId],
    references: [hospitals.id],
  }),
  logs: many(logs),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  visit: one(visits, { fields: [logs.visitId], references: [visits.id] }),
  nurse: one(nurses, { fields: [logs.nurseId], references: [nurses.id] }),
}));
