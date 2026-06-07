import { NextRequest, NextResponse } from "next/server";
import { computeToken, setAdminCookie } from "@/lib/admin-auth";

// Simple in-memory rate limiter (resets on restart)
const attempts = new Map<string, { count: number; until: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.until > now) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { password } = await req.json();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    const current = attempts.get(ip) ?? { count: 0, until: 0 };
    const count = current.count + 1;
    attempts.set(ip, { count, until: count >= 5 ? now + 15 * 60 * 1000 : 0 });
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  return setAdminCookie(res, password);
}
