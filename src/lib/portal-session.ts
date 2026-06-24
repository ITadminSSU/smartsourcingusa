import { SignJWT, jwtVerify } from "jose";

// Separate session from /admin: own cookie + own secret so the two areas
// never share logins.
export const PORTAL_COOKIE = "ss_portal";
const SESSION_TTL = "7d";

export type PortalRole = "employee" | "lead" | "accounting" | "hr_admin";

export type PortalSession = {
  uid: number;
  username: string;
  email: string;
  name: string;
  role: PortalRole;
  mustChange: boolean;
};

export function normalizePortalRole(role: unknown): PortalRole {
  return role === "lead" || role === "accounting" || role === "hr_admin"
    ? role
    : "employee";
}

function getSecret(): Uint8Array {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "PORTAL_SESSION_SECRET is missing or too short (use at least 16 characters)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signPortalSession(payload: PortalSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function verifyPortalSession(
  token: string | undefined
): Promise<PortalSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      uid: Number(payload.uid),
      username: String(payload.username ?? ""),
      email: String(payload.email),
      name: String(payload.name),
      role: normalizePortalRole(payload.role),
      mustChange: Boolean(payload.mustChange),
    };
  } catch {
    return null;
  }
}
