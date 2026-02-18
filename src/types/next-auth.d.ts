import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      credits: number; // Add your custom field here
    } & DefaultSession["user"];
  }

  interface User {
    credits: number; // Also add it to the User object
  }
}