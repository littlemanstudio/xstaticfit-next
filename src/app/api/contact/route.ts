import { NextRequest, NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  if (rateLimited(request, "contact", 3, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    email?: unknown;
    message?: unknown;
    // Honeypot: real visitors never fill this hidden field.
    company?: unknown;
  } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true });

  const name = typeof body.name === "string" ? body.name.replace(/[\r\n]+/g, " ").trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (name.length > 100 || email.length > 254 || message.length > 5000 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Xstatic Fit <onboarding@resend.dev>",
        to: process.env.CONTACT_TO_EMAIL ?? "contact@xstaticfit.com",
        reply_to: email,
        subject: `New contact form message from ${name}`,
        text: message,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to send" }, { status: 502 });
    }
  } else {
    console.log("Contact form submission (RESEND_API_KEY not set): message received");
  }

  return NextResponse.json({ ok: true });
}
