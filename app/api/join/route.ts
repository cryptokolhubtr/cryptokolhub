import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, telegram, twitter, country, role, message } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to a simple JSON file (replace with DB later)
    const entry = {
      id: Date.now().toString(),
      name,
      email,
      telegram: telegram || "",
      twitter: twitter || "",
      country: country || "",
      role,
      message: message || "",
      submittedAt: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), "data", "applications.json");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let existing: typeof entry[] = [];
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch {}
    }
    existing.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
