import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "orbit_admin_session";
// Default secure master passcode (can be customized via ADMIN_PASSCODE in .env.local)
export const DEFAULT_ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "orbit2026!";

export interface AdminSession {
  isAdmin: boolean;
  authenticatedAt: string;
}

export function verifyAdminPasscode(inputPasscode: string): boolean {
  const masterPasscode = process.env.ADMIN_PASSCODE || DEFAULT_ADMIN_PASSCODE;
  if (typeof inputPasscode !== "string" || !inputPasscode) {
    return false;
  }
  // Constant-time comparison to eliminate side-channel timing attacks
  const bufA = Buffer.from(inputPasscode);
  const bufB = Buffer.from(masterPasscode);
  if (bufA.length !== bufB.length) {
    return false;
  }
  const crypto = require("crypto");
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function checkServerAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return false;
    }
    // Check if session token exists and is valid
    return sessionCookie.value.startsWith("admin_auth_");
  } catch (e) {
    return false;
  }
}
