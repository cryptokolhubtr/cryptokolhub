import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, telegram, twitter, country, role, message, type } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const applicantType = type === "company" ? "company" : "individual";

    const entry = {
      id: Date.now().toString(),
      type: applicantType,
      name, email,
      telegram: telegram || "",
      twitter: twitter || "",
      country: country || "",
      role,
      message: message || "",
      submittedAt: new Date().toISOString(),
    };

    // Save to JSON file
    const filePath = path.join(process.cwd(), "data", "applications.json");
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing: typeof entry[] = [];
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch {}
    }
    existing.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

    // Send email notification
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const typeLabel = applicantType === "company" ? "🏢 Firma / Company" : "👤 Şahıs / Individual";
      await transporter.sendMail({
        from: `"Crypto KOL Hub" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `🌐 New Application: ${name} — ${role} (${applicantType === "company" ? "Firma" : "Şahıs"})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;">
            <h2 style="color:#00ff88;margin:0 0 8px;">New Network Application</h2>
            <p style="color:#6366f1;margin:0 0 24px;font-size:14px;">${typeLabel}</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;width:130px;">Type</td><td style="padding:8px 0;font-weight:600;">${typeLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#6366f1;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#888;">Role</td><td style="padding:8px 0;">${role}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Telegram</td><td style="padding:8px 0;">${telegram || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">X / Twitter</td><td style="padding:8px 0;">${twitter || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Country</td><td style="padding:8px 0;">${country || "—"}</td></tr>
            </table>
            ${message ? `<div style="margin-top:20px;padding:16px;background:#1a1a1a;border-radius:8px;border-left:3px solid #6366f1;"><p style="color:#888;margin:0 0 6px;font-size:12px;">MESSAGE</p><p style="margin:0;">${message}</p></div>` : ""}
            <p style="margin-top:24px;color:#555;font-size:12px;">Submitted: ${new Date().toLocaleString("en-US")}</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
