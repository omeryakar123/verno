import { eq, inArray } from "drizzle-orm";
import type postgres from "postgres";
import { db, schema } from "@/db";
import { loadUserBadgesBatch } from "@/lib/server/user-badges";
import type { UserBadgeId } from "@/lib/user-badges";

export type AuthorProfile = {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  badges?: UserBadgeId[];
};

/** Şikayet/yorum yazarının görünen adı — profile + user.name yedeklemesi. */
export async function loadAuthorProfile(userId: string): Promise<AuthorProfile | null> {
  const map = await loadAuthorProfiles([userId]);
  return map.get(userId) ?? null;
}

async function loadAuthorProfilesCore(
  userIds: string[],
): Promise<Map<string, Omit<AuthorProfile, "badges">>> {
  const map = new Map<string, Omit<AuthorProfile, "badges">>();
  if (userIds.length === 0) return map;

  const rows = await db
    .select({
      id: schema.profiles.id,
      full_name: schema.profiles.fullName,
      username: schema.profiles.username,
      avatar_url: schema.profiles.avatarUrl,
      user_name: schema.user.name,
    })
    .from(schema.profiles)
    .leftJoin(schema.user, eq(schema.profiles.id, schema.user.id))
    .where(inArray(schema.profiles.id, userIds));

  for (const row of rows) {
    map.set(row.id, {
      full_name: row.full_name?.trim() || row.user_name?.trim() || null,
      username: row.username,
      avatar_url: row.avatar_url,
    });
  }

  const missing = userIds.filter((id) => !map.has(id));
  if (missing.length > 0) {
    const users = await db
      .select({ id: schema.user.id, name: schema.user.name })
      .from(schema.user)
      .where(inArray(schema.user.id, missing));
    for (const u of users) {
      if (u.name?.trim()) {
        map.set(u.id, { full_name: u.name.trim(), username: null, avatar_url: null });
      }
    }
  }

  return map;
}

export async function loadAuthorProfiles(
  userIds: string[],
  opts?: { withBadges?: boolean },
): Promise<Map<string, AuthorProfile>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const core = await loadAuthorProfilesCore(unique);
  const map = new Map<string, AuthorProfile>();

  for (const [id, profile] of core) {
    map.set(id, { ...profile });
  }

  if (opts?.withBadges !== false && unique.length > 0) {
    const badgeMap = await loadUserBadgesBatch(unique);
    for (const id of unique) {
      const profile = map.get(id);
      if (!profile) continue;
      profile.badges = badgeMap.get(id) ?? [];
    }
  }

  return map;
}

/** admin@verno.bg görünen adını senkronize eder. */
export async function syncAdminDisplayName(pg: postgres.Sql): Promise<void> {
  await pg`
    UPDATE "user" SET name = 'Admin', updated_at = now()
    WHERE lower(email) = 'admin@verno.bg'
       OR lower(name) = 'test admin'
  `.catch(() => {});

  await pg`
    INSERT INTO profiles (id, full_name, username, email_verified)
    SELECT u.id, 'Admin', 'admin', true
    FROM "user" u
    WHERE lower(u.email) = 'admin@verno.bg'
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Admin',
      updated_at = now()
  `.catch(() => {});

  await pg`
    UPDATE profiles SET full_name = 'Admin', updated_at = now()
    WHERE id IN (SELECT id FROM "user" WHERE lower(email) = 'admin@verno.bg')
       OR lower(username) = 'admin'
       OR lower(full_name) = 'test admin'
  `.catch(() => {});
}
