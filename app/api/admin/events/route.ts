import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import * as fs from "fs";
import * as path from "path";

const FILE = () => path.join(process.cwd(), "data", "events.json");

function readEvents() {
  const f = FILE();
  if (!fs.existsSync(f)) return [];
  try { return JSON.parse(fs.readFileSync(f, "utf-8")); } catch { return []; }
}

function writeEvents(data: unknown[]) {
  const dir = path.dirname(FILE());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE(), JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ events: readEvents() });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, date, location, description, imageUrl, link } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const event = {
    id: Date.now().toString(),
    name,
    date: date || "",
    location: location || "",
    description: description || "",
    imageUrl: imageUrl || "",
    link: link || "",
    addedAt: new Date().toISOString(),
  };

  const existing = readEvents();
  existing.push(event);
  writeEvents(existing);

  return NextResponse.json({ ok: true, event });
}
