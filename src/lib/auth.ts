import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { UserRole, Permission, hasPermission } from "./enums";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me-in-production"
);

export interface JWTPayload {
  sub: string;        // user id
  email: string;
  companyId: number;
  role: UserRole;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as unknown as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function can(role: UserRole, permission: Permission): boolean {
  return hasPermission(role, permission);
}
