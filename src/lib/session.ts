import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ss_admin";
const SESSION_TTL = "7d";

export type UserRole = "admin" | "editor";

export type SessionPayload = {
  uid: number;
  email: string;
  name: string;
  role: UserRole;
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short (use at least 16 characters)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      uid: Number(payload.uid),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "admin" ? "admin" : "editor",
    };
  } catch {
    return null;
  }
}
