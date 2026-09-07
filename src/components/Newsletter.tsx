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
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value;
    if (email && email.includes("@")) {
      setStatus("ok");
      e.currentTarget.reset();
    } else {
      setStatus("error");
    }
  }

  const isLight = variant === "light";

  return (
    <div>
      {label && <p className={`mb-3 text-sm ${isLight ? "text-ink/70" : "text-white/70"}`}>{label}</p>}
      <form onSubmit={handleSubmit} className="flex gap-0">
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
          {cta}
        </button>
      </form>
      {status === "ok" && (
        <p className="mt-2 text-xs text-accent">Thank you! Your submission has been received!</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Oops! Something went wrong. Check your email.</p>
      )}
    </div>
  );
}
