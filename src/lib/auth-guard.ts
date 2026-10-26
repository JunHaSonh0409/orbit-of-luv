import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "orbit_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

const TOKEN_VERSION = "v1";

export interface AdminSession {
  isAdmin: boolean;
  authenticatedAt: string;
}

// Master passcode must come from ADMIN_PASSCODE (.env.local / Vercel env). No built-in default.
function getAdminPasscode(): string | null {
  return process.env.ADMIN_PASSCODE || null;
}

// Signing key for session cookies. Falls back to the passcode so that
// rotating the passcode also invalidates every outstanding session.
function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || getAdminPasscode();
}

// Constant-time comparison to eliminate side-channel timing attacks
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyAdminPasscode(inputPasscode: string): boolean {
  const masterPasscode = getAdminPasscode();
  if (!masterPasscode) {
    console.error("ADMIN_PASSCODE is not set - admin login is disabled.");
    return false;
  }
  if (typeof inputPasscode !== "string" || !inputPasscode) {
    return false;
  }
  return safeEqual(inputPasscode, masterPasscode);
}

// Token format: v1.<expiresAtMs>.<nonce>.<hmac(v1.<expiresAtMs>.<nonce>)>
export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `${TOKEN_VERSION}.${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) return false;

  const [version, expiresAtRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  return safeEqual(signature, sign(`${version}.${expiresAtRaw}.${nonce}`, secret));
}

export async function checkServerAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  } catch {
    return false;
  }
}
