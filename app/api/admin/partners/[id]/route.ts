import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import * as fs from "fs";
import * as path from "path";

const FILE = () => path.join(process.cwd(), "data", "partners.json");

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const f = FILE();
  if (!fs.existsSync(f)) return NextResponse.json({ ok: true });

  let data: { id: string }[] = [];
  try { data = JSON.parse(fs.readFileSync(f, "utf-8")); } catch {}

  const updated = data.filter(p => p.id !== params.id);
  fs.writeFileSync(f, JSON.stringify(updated, null, 2));

  return NextResponse.json({ ok: true });
}
