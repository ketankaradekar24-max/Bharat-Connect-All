import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  adminAuditLogs,
  studentProfiles,
  userNotificationPreferences,
  users,
} from './schema.ts';

export interface UserSessionPayload {
  user: typeof users.$inferSelect;
  profile: typeof studentProfiles.$inferSelect | null;
  notificationPreferences: typeof userNotificationPreferences.$inferSelect | null;
  adminBootstrapped: boolean;
}

export async function getAdminCount(): Promise<number> {
  try {
    const result = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.role, 'admin'));
    return Number(result[0]?.value ?? 0);
  } catch (error) {
    console.error('Failed to count admin users:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName: string
): Promise<typeof users.$inferSelect> {
  try {
    const safeName = displayName.trim() || email.split('@')[0] || 'Student';
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: safeName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    const user = result[0];

    await db
      .insert(studentProfiles)
      .values({
        userId: user.id,
        fullName: safeName,
      })
      .onConflictDoNothing({ target: studentProfiles.userId });

    await db
      .insert(userNotificationPreferences)
      .values({
        userId: user.id,
      })
      .onConflictDoNothing({ target: userNotificationPreferences.userId });

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    if (bootstrapEmail && email.toLowerCase() === bootstrapEmail && user.role !== 'admin') {
      const adminTotal = await getAdminCount();
      if (adminTotal === 0) {
        const promoted = await db
          .update(users)
          .set({ role: 'admin', updatedAt: new Date() })
          .where(eq(users.id, user.id))
          .returning();
        await db.insert(adminAuditLogs).values({
          actorUserId: user.id,
          action: 'ADMIN_AUTO_BOOTSTRAP',
          entityType: 'user',
          entityId: String(user.id),
          details: { method: 'ADMIN_BOOTSTRAP_EMAIL' },
        });
        return promoted[0];
      }
    }

    return user;
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function getUserSessionData(userId: number): Promise<UserSessionPayload> {
  try {
    const [userRows, profileRows, prefRows, adminTotal] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1),
      db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, userId))
        .limit(1),
      getAdminCount(),
    ]);

    if (!userRows[0]) {
      throw new Error('User record not found.');
    }

    return {
      user: userRows[0],
      profile: profileRows[0] ?? null,
      notificationPreferences: prefRows[0] ?? null,
      adminBootstrapped: adminTotal > 0,
    };
  } catch (error) {
    console.error('Failed to load user session data:', error);
    throw new Error('Failed to load account data.', { cause: error });
  }
}

export async function bootstrapFirstAdmin(userId: number): Promise<{
  promoted: boolean;
  user: typeof users.$inferSelect;
}> {
  try {
    const adminTotal = await getAdminCount();
    if (adminTotal > 0) {
      const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return { promoted: false, user: existing[0] };
    }

    const updated = await db
      .update(users)
      .set({ role: 'admin', onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    await db.insert(adminAuditLogs).values({
      actorUserId: userId,
      action: 'ADMIN_BOOTSTRAP',
      entityType: 'user',
      entityId: String(userId),
      details: { reason: 'Initial zero-admin platform setup' },
    });

    return { promoted: true, user: updated[0] };
  } catch (error) {
    console.error('Failed to bootstrap admin:', error);
    throw new Error('Failed to initialize platform administrator.', { cause: error });
  }
}
