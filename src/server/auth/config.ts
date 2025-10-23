import type { DefaultSession, NextAuthConfig } from "next-auth";
import { eq } from 'drizzle-orm';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '~/env';
import { db } from '~/server/db';
import { accounts, nurses, parents, sessions, users, verificationTokens } from '~/server/db/schema';

import { DrizzleAdapter } from '@auth/drizzle-adapter';

export type UserRole = "admin" | "nurse" | "parent";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any,
  callbacks: {
    // This runs when a user signs in (first time or returning)
    signIn: async () => {
      return true; // Allow sign in
    },

    // This callback is called whenever a session is checked
    // With database sessions, the user is fetched from DB, so it exists when this runs
    session: async ({ session, user }) => {
      console.log("session callback - user:", user);

      const userEmail = user.email;
      const userId = user.id;
      let userRole = (user as any).role as UserRole | null;

      // Only run linking logic if user doesn't have a role yet
      if (!userRole && userEmail && userId) {
        console.log("session callback - no role, checking for nurse/parent");

        // Check if there's a nurse entry for this email
        const [nurseEntry] = await db
          .select()
          .from(nurses)
          .where(eq(nurses.email, userEmail))
          .limit(1);

        console.log("session callback - nurseEntry:", nurseEntry);

        if (nurseEntry && !nurseEntry.userId) {
          // User is a nurse - link them and set role
          await db
            .update(nurses)
            .set({ userId: userId })
            .where(eq(nurses.id, nurseEntry.id));

          await db
            .update(users)
            .set({ role: "nurse" })
            .where(eq(users.id, userId));

          userRole = "nurse";
          console.log("session callback - linked as nurse");
        } else {
          // Check if there's a parent entry for this email
          const [parentEntry] = await db
            .select()
            .from(parents)
            .where(eq(parents.email, userEmail))
            .limit(1);

          console.log("session callback - parentEntry:", parentEntry);

          if (parentEntry && !parentEntry.userId) {
            // User is a parent - link them and set role
            await db
              .update(parents)
              .set({ userId: userId })
              .where(eq(parents.id, parentEntry.id));

            await db
              .update(users)
              .set({ role: "parent" })
              .where(eq(users.id, userId));

            userRole = "parent";
            console.log("session callback - linked as existing parent");
          } else if (!parentEntry) {
            // No parent entry exists - create a bare parent object
            await db
              .update(users)
              .set({ role: "parent" })
              .where(eq(users.id, userId));

            // Create a basic parent record that they can fill out later
            await db.insert(parents).values({
              userId: userId,
              name: user.name || "",
              email: userEmail,
              phoneNumber: "", // Will be filled later
              homeAddress: "", // Will be filled later
            });

            userRole = "parent";
            console.log("session callback - created new parent");
          } else {
            // Parent entry exists and is already linked
            userRole = "parent";
            console.log("session callback - already linked parent");
          }
        }
      }

      // Default to parent if somehow still null (shouldn't happen)
      const role = userRole || "parent";

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          role,
        },
      };
    },
  },
} satisfies NextAuthConfig;
