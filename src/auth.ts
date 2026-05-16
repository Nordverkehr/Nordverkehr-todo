import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

/**
 * Prüft über die Discord Bot API ob ein User eine bestimmte Rolle hat.
 * Gibt `true` zurück wenn die Rolle vorhanden ist, sonst `false`.
 */
async function hasRequiredDiscordRole(discordUserId: string): Promise<boolean> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const requiredRoleId = process.env.DISCORD_REQUIRED_ROLE_ID;

  if (!botToken || !guildId || !requiredRoleId) {
    console.error(
      "[Auth] Fehlende Umgebungsvariablen: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID oder DISCORD_REQUIRED_ROLE_ID"
    );
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      }
    );

    // 404 = User ist nicht auf dem Server
    if (response.status === 404) {
      console.warn(`[Auth] User ${discordUserId} ist nicht Mitglied des Servers.`);
      return false;
    }

    if (!response.ok) {
      console.error(`[Auth] Discord API Fehler: ${response.status} ${response.statusText}`);
      return false;
    }

    const member = await response.json();
    const memberRoles: string[] = member.roles ?? [];

    const hasRole = memberRoles.includes(requiredRoleId);
    if (!hasRole) {
      console.warn(
        `[Auth] User ${discordUserId} hat die erforderliche Rolle (${requiredRoleId}) nicht. Vorhanden: [${memberRoles.join(", ")}]`
      );
    }
    return hasRole;
  } catch (error) {
    console.error("[Auth] Fehler beim Abrufen der Discord-Mitgliedschaft:", error);
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      // Benötigte Scopes: identify + guilds.members.read wird NICHT benötigt,
      // da wir den Bot-Token für den Rollen-Check verwenden.
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "discord") {
        const profileData = profile as any;
        const discordUserId: string = profileData?.id;

        if (!discordUserId) {
          console.error("[Auth] Keine Discord User-ID im Profil gefunden.");
          return false;
        }

        // Rollen-Check über Discord Bot API
        const allowed = await hasRequiredDiscordRole(discordUserId);
        return allowed;
      }
      return false;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
