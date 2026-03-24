import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// We combine the Edge-safe config with the Node-only adapter and authorized logic.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [
    ...authConfig.providers.filter(p => (p as { id: string }).id !== "credentials"),
    {
        id: "credentials",
        name: "credentials",
        type: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
  
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
          });
  
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password);
          if (!valid) return null;
  
          return { id: user.id, email: user.email, name: user.name, image: user.image };
        },
    }
  ],
});
