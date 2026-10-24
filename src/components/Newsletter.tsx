"use client";

import { useState, FormEvent } from "react";

export default function Newsletter({
  label,
  cta = "Join",
  variant = "dark",
}: {
  label?: string;
  cta?: string;
  variant?: "dark" | "light";
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const company = (form.elements.namedItem("company") as HTMLInputElement)?.value;
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, browserLang: navigator.language, source: "site" }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const isLight = variant === "light";

  return (
    <div>
      {label && <p className={`mb-3 text-sm ${isLight ? "text-ink/70" : "text-white/70"}`}>{label}</p>}
      <form onSubmit={handleSubmit} className="flex gap-0">
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <input
          name="email"
          type="email"
          required
          placeholder="your email address"
          className={`w-full border px-4 py-3 text-sm outline-none ${
            isLight
              ? "border-line bg-white text-ink placeholder:text-ink/40"
              : "border-white/20 bg-transparent text-white placeholder:text-white/40"
          }`}
        />
        <button
          type="submit"
          className="shrink-0 bg-accent px-5 text-xs font-stencil uppercase tracking-[0.15em] text-ink transition hover:brightness-95"
        >
          {status === "sending" ? "..." : cta}
        </button>
      </form>
      <p className={`mt-2 text-[11px] leading-snug ${isLight ? "text-ink/50" : "text-white/40"}`}>
        By joining you agree to get marketing emails from Xstatic Fit. Unsubscribe anytime.
      </p>
      {status === "ok" && (
        <p className="mt-2 text-xs text-accent">You are in. Check your inbox for your welcome email.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Something went wrong. Check your email and try again.</p>
      )}
    </div>
  );
}
