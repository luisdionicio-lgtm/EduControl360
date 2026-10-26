import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isDemoEnabled, demoRoles, demoSubject, type DemoRole } from "./demo";
import { createDatabase } from "@edu/database";
export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);
export const authOptions: NextAuthOptions = {
  ...(isDemoEnabled()
    ? {
        cookies: {
          sessionToken: {
            name: "educontrol.demo.session-token",
            options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false },
          },
          csrfToken: {
            name: "educontrol.demo.csrf-token",
            options: { httpOnly: true, sameSite: "lax" as const, path: "/", secure: false },
          },
          callbackUrl: {
            name: "educontrol.demo.callback-url",
            options: { sameSite: "lax" as const, path: "/", secure: false },
          },
        },
      }
    : {}),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            authorization: { params: { scope: "openid email profile", prompt: "select_account" } },
            checks: ["pkce", "state", "nonce"],
          }),
        ]
      : []),
    ...(isDemoEnabled()
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demostración local",
            credentials: { role: { label: "Perfil de demostración", type: "text" } },
            async authorize(credentials) {
              if (!isDemoEnabled() || !demoRoles.includes(credentials?.role as DemoRole))
                return null;
              const db = createDatabase();
              try {
                const user = await db.user.findUnique({
                  where: { googleSub: demoSubject(credentials!.role as DemoRole) },
                });
                return user?.active ? { id: user.id, name: user.name, email: user.email } : null;
              } finally {
                await db.$disconnect();
              }
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "demo") return isDemoEnabled();
      const google = profile as
        { email?: string; email_verified?: boolean; sub?: string; name?: string } | undefined;
      if (
        account?.provider !== "google" ||
        !google?.email_verified ||
        !google.email ||
        !google.sub ||
        google.sub !== account.providerAccountId
      )
        return false;
      const db = createDatabase();
      try {
        const existing = await db.user.findUnique({ where: { googleSub: google.sub } });
        if (existing && !existing.active) return false;
        const email = google.email.toLowerCase();
        const collision = await db.user.findUnique({ where: { email } });
        if (collision && collision.googleSub !== google.sub) return false;
        await db.user.upsert({
          where: { googleSub: google.sub },
          create: { googleSub: google.sub, email, name: google.name ?? email },
          update: { email, name: google.name ?? email },
        });
        return true;
      } finally {
        await db.$disconnect();
      }
    },
    async jwt({ token, account, user: signedUser }) {
      if (account?.provider === "google" || (account?.provider === "demo" && isDemoEnabled())) {
        const db = createDatabase();
        try {
          const user = await db.user.findUniqueOrThrow({
            where:
              account.provider === "google"
                ? { googleSub: account.providerAccountId }
                : { id: signedUser.id },
          });
          const session = await db.authSession.create({
            data: { userId: user.id, expiresAt: new Date(Date.now() + 8 * 3600000) },
          });
          token.uid = user.id;
          token.sid = session.id;
        } finally {
          await db.$disconnect();
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = typeof token.uid === "string" ? token.uid : "";
      session.sessionId = typeof token.sid === "string" ? token.sid : "";
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && typeof message.token?.sid === "string") {
        const db = createDatabase();
        try {
          await db.authSession.updateMany({
            where: { id: message.token.sid },
            data: { revokedAt: new Date() },
          });
        } finally {
          await db.$disconnect();
        }
      }
    },
  },
};
