import type { DefaultSession, NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  nurses,
  parents,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

import { DrizzleAdapter } from "@auth/drizzle-adapter";

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
// Build providers array conditionally based on available credentials
const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email as string))
        .limit(1);

      if (!user || !user.password) {
        return null;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        credentials.password as string,
        user.password,
      );

      if (!isValidPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user.role || "parent") as UserRole, // Default to parent if role is null
      };
    },
  }),
  GoogleProvider({
    clientId: env.AUTH_GOOGLE_ID,
    clientSecret: env.AUTH_GOOGLE_SECRET,
  }),
];

// Add LINE provider if credentials are available
if (env.AUTH_LINE_ID && env.AUTH_LINE_SECRET) {
  providers.push(
    LineProvider({
      clientId: env.AUTH_LINE_ID,
      clientSecret: env.AUTH_LINE_SECRET,
    }) as any,
  );
}

export const authConfig = {
  providers,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as any,
  session: {
    strategy: "jwt", // Must use JWT for CredentialsProvider compatibility
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
  },
  callbacks: {
    // This runs when a user signs in (first time or returning)
    signIn: async ({ user }) => {
      // For CredentialsProvider, user is already authenticated
      // For OAuth, user will be created/linked by adapter
      return true;
    },

    // JWT callback - runs on every token creation/update
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }

      // On sign in, check for role linking if not already set
      if (trigger === "signIn" && token.email && !token.role) {
        const userEmail = token.email as string;
        const userId = token.sub;

        if (userId) {
          // Check if there's a nurse entry for this email
          const [nurseEntry] = await db
            .select()
            .from(nurses)
            .where(eq(nurses.email, userEmail))
            .limit(1);

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

            token.role = "nurse";
          } else {
            // Check if there's a parent entry for this email
            const [parentEntry] = await db
              .select()
              .from(parents)
              .where(eq(parents.email, userEmail))
              .limit(1);

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

              token.role = "parent";
            } else if (!parentEntry) {
              // For OAuth users without a parent entry, create one
              // (Credentials users get parent created during registration)
              const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

              if (existingUser && !existingUser.role) {
                await db
                  .update(users)
                  .set({ role: "parent" })
                  .where(eq(users.id, userId));

                // Create a basic parent record
                await db.insert(parents).values({
                  userId: userId,
                  name: existingUser.name || "",
                  email: userEmail,
                  phoneNumber: "",
                  homeAddress: "",
                });

                token.role = "parent";
              }
            } else {
              token.role = "parent";
            }
          }
        }
      }

      return token;
    },

    // Session callback - with JWT strategy, we always use token
    session: async ({ session, token }) => {
      // JWT session - role and id come from token
      const role = (token.role as UserRole) || "parent";

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
          role,
        },
      };
    },
  },
} satisfies NextAuthConfig;
