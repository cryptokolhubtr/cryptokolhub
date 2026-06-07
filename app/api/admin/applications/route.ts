import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import * as fs from "fs";
import * as path from "path";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = path.join(process.cwd(), "data", "applications.json");
  let data: unknown[] = [];
  if (fs.existsSync(filePath)) {
    try { data = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch {}
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "individual" | "company" | null

  const filtered = type ? data.filter((a: unknown) => (a as { type?: string }).type === type) : data;
  // Sort newest first
  filtered.sort((a, b) => {
    const at = (a as { submittedAt?: string }).submittedAt ?? "";
    const bt = (b as { submittedAt?: string }).submittedAt ?? "";
    return bt.localeCompare(at);
  });

  return NextResponse.json({ applications: filtered, total: filtered.length });
}
