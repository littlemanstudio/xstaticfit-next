import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, message } = body as { name?: string; email?: string; message?: string };

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    console.log("Contact form submission (RESEND_API_KEY not set):", { name, email, message });
  }

  return NextResponse.json({ ok: true });
}
