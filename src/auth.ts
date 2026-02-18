import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
// No longer need to import Role here if we handle it dynamically, 
// but it's fine to keep for TS types.

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // 1. ADD ROLE HERE: This passes it from the DB to the jwt callback
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name || "",
          credits: user.credits,
          role: user.role // Passing the role from the database
        };
      },
    }),
  ],
  callbacks: {
  async jwt({ token, user, trigger, session }) {
    // Initial sign-in
    if (user) {
      token.id = user.id;
      token.credits = (user as any).credits;
      token.role = (user as any).role;
    }

    // HANDLE UPDATES: Fetch fresh data from DB
   if (trigger === "update" && session?.user?.name) {
      token.name = session.user.name;
    }

    return token;

  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      (session.user as any).credits = token.credits;
      (session.user as any).role = token.role;
    }
    return session;
  },
},
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});