"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Your name"
          className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help?"
        className="border border-line px-4 py-3 text-sm outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="self-start bg-ink px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Contact Now"}
      </button>
      {status === "ok" && (
        <p className="text-sm text-accent">Thank you! Your message has been received.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">
          Something went wrong. Email us directly at contact@xstaticfit.com.
        </p>
      )}
    </form>
  );
}
