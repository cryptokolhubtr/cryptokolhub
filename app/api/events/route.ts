import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "events.json");
  let data: unknown[] = [];
  if (fs.existsSync(filePath)) {
    try { data = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch {}
  }
  // Sort by date descending
  (data as { date?: string }[]).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return NextResponse.json({ events: data });
}
