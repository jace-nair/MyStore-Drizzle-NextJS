import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user results in database
        const results = await db
          .select()
          .from(user)
          .where(eq(user.email, credentials.email as string));

        //Use the first element of the results array
        const dbUser = results[0];

        // Check if user exists and if the password matches
        if (dbUser && dbUser.password) {
          const isMatch = compareSync(
            credentials.password as string,
            dbUser.password
          );

          // If password correct, then return user
          if (isMatch) {
            return {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
            };
          }
        }
        // If user does not exist or password does not match throw new Error or return null
        throw new Error("Incorrect credentials");
        //return null;
      },
    }),
  ],
  callbacks: {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    async session({ session, user, trigger, token }: any) {
      // Set the user ID from the token
      session.user.id = token.sub;
      // Set the user role from the token
      session.user.role = token.role;
      // Set the user name from the token
      session.user.name = token.name;

      // Check the token data in the console
      //console.log(token);

      // If there is an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    async jwt({ token, user }: any) {
      // Assign user field to token
      if (user) {
        token.role = user.role;

        // If the user has no name then use the first part of the email. This is mainly for accounts.
        if (user.name === "no name") {
          token.name = user.email!.split("@")[0];

          // Update the database of the current user to reflect the token name
          await db
            .update(user)
            .set({
              name: token.name,
            })
            .where(eq(user.id, user.id));
        }
      }
      return token;
    },
    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
