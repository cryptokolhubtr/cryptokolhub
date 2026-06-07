import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.ADMIN_SECRET ?? "kh-admin-secret-change-in-env";
export const COOKIE_NAME = "kh_admin_sess";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function computeToken(password: string): string {
  return createHmac("sha256", SECRET).update(password).digest("hex");
}

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (!pw) return false;
  const expected = computeToken(pw);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function setAdminCookie(res: NextResponse, password: string): NextResponse {
  const token = computeToken(password);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

export function clearAdminCookie(res: NextResponse): NextResponse {
  res.cookies.delete(COOKIE_NAME);
  return res;
}
