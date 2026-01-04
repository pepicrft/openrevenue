import { drizzle } from "drizzle-orm/d1";
import { eq, and, gt } from "drizzle-orm";
import * as schema from "../db/schema";

export interface AuthEnv {
  DB: D1Database;
  RESEND_API_KEY?: string;
  APP_URL?: string;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateId(): string {
  return crypto.randomUUID();
}

export async function requestEmailVerification(
  env: AuthEnv,
  email: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const db = drizzle(env.DB, { schema });
  const normalizedEmail = email.toLowerCase().trim();

  // Upsert user
  let user = await db.query.dashboardUsers.findFirst({
    where: eq(schema.dashboardUsers.email, normalizedEmail),
  });

  const now = new Date().toISOString();

  if (!user) {
    const newUser = {
      id: generateId(),
      email: normalizedEmail,
      emailVerified: 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(schema.dashboardUsers).values(newUser);
    user = newUser;
  }

  // Generate verification token (expires in 15 minutes)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Delete any existing tokens for this user
  await db
    .delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.userId, user.id));

  // Create new token
  await db.insert(schema.emailVerificationTokens).values({
    id: generateId(),
    userId: user.id,
    token,
    expiresAt,
    createdAt: now,
  });

  // Send email if Resend API key is configured
  if (env.RESEND_API_KEY) {
    const appUrl = env.APP_URL || "http://localhost:5173";
    const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "OpenRevenue <noreply@openrevenue.dev>",
          to: normalizedEmail,
          subject: "Sign in to OpenRevenue",
          html: `
            <h1>Sign in to OpenRevenue</h1>
            <p>Click the link below to sign in to your OpenRevenue dashboard:</p>
            <p><a href="${verifyUrl}">Sign in to OpenRevenue</a></p>
            <p>This link expires in 15 minutes.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
          `,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send email:", await response.text());
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  // Return token for local development (when no email service)
  return {
    success: true,
    // Only include token in response if no email service configured (for local dev)
    token: env.RESEND_API_KEY ? undefined : token,
  };
}

export async function verifyEmailToken(
  env: AuthEnv,
  token: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  const db = drizzle(env.DB, { schema });
  const now = new Date().toISOString();

  // Find valid token
  const verificationToken = await db.query.emailVerificationTokens.findFirst({
    where: and(
      eq(schema.emailVerificationTokens.token, token),
      gt(schema.emailVerificationTokens.expiresAt, now)
    ),
  });

  if (!verificationToken) {
    return { success: false, error: "Invalid or expired token" };
  }

  // Mark user as verified
  await db
    .update(schema.dashboardUsers)
    .set({ emailVerified: 1, updatedAt: now })
    .where(eq(schema.dashboardUsers.id, verificationToken.userId));

  // Delete the used token
  await db
    .delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.id, verificationToken.id));

  // Create session (expires in 30 days)
  const sessionToken = generateToken();
  const sessionExpiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  await db.insert(schema.sessions).values({
    id: generateId(),
    userId: verificationToken.userId,
    token: sessionToken,
    expiresAt: sessionExpiresAt,
    createdAt: now,
  });

  return { success: true, sessionToken };
}

export async function validateSession(
  env: AuthEnv,
  sessionToken: string
): Promise<{ valid: boolean; userId?: string; email?: string }> {
  const db = drizzle(env.DB, { schema });
  const now = new Date().toISOString();

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(schema.sessions.token, sessionToken),
      gt(schema.sessions.expiresAt, now)
    ),
  });

  if (!session) {
    return { valid: false };
  }

  const user = await db.query.dashboardUsers.findFirst({
    where: eq(schema.dashboardUsers.id, session.userId),
  });

  if (!user) {
    return { valid: false };
  }

  return { valid: true, userId: user.id, email: user.email };
}

export async function logout(
  env: AuthEnv,
  sessionToken: string
): Promise<void> {
  const db = drizzle(env.DB, { schema });
  await db
    .delete(schema.sessions)
    .where(eq(schema.sessions.token, sessionToken));
}

export async function getPendingVerifications(
  env: AuthEnv
): Promise<Array<{ email: string; token: string; expiresAt: string }>> {
  const db = drizzle(env.DB, { schema });
  const now = new Date().toISOString();

  const tokens = await db
    .select({
      token: schema.emailVerificationTokens.token,
      expiresAt: schema.emailVerificationTokens.expiresAt,
      email: schema.dashboardUsers.email,
    })
    .from(schema.emailVerificationTokens)
    .innerJoin(
      schema.dashboardUsers,
      eq(schema.emailVerificationTokens.userId, schema.dashboardUsers.id)
    )
    .where(gt(schema.emailVerificationTokens.expiresAt, now));

  return tokens;
}
