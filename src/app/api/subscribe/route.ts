import { NextRequest, NextResponse } from "next/server";
import { rateLimited } from "@/lib/rateLimit";
import { klaviyoConfigured, languageFor, subscribeEmail } from "@/lib/klaviyo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Newsletter signup. The form shows the consent line next to the button, so posting here is the opt-in. */
export async function POST(request: NextRequest) {
  if (rateLimited(request, "subscribe", 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    browserLang?: string;
    source?: string;
    // Honeypot: real visitors never fill this hidden field.
    company?: string;
  };

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true });

  if (!klaviyoConfigured()) {
    // Fail loudly in logs instead of telling the visitor they are subscribed when nothing was saved.
    console.error("Newsletter signup not saved: Klaviyo is not configured");
    return NextResponse.json({ error: "Signup is not available right now" }, { status: 503 });
  }

  const result = await subscribeEmail({
    email,
    language: languageFor(null, body.browserLang),
    source: String(body.source ?? "site").slice(0, 40),
  });
  if (!result.ok) return NextResponse.json({ error: "Could not subscribe" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
