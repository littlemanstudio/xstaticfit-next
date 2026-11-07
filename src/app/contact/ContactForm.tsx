"use client";

import { useEffect, useRef, useState, FormEvent } from "react";

type Status = "idle" | "loading" | "ok" | "error";
type StepKey = "message" | "email" | "name";

const STEPS: StepKey[] = ["message", "email", "name"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// One question at a time: what they need, where to answer, who they are.
// Same /api/contact endpoint and honeypot as before; only the asking changed.
const PROMPTS: Record<StepKey, { label: string; hint: string; error: string }> = {
  message: {
    label: "What can we help you with?",
    hint: "A line or two is plenty.",
    error: "Tell us what you need so we can answer.",
  },
  email: {
    label: "Where should we send the answer?",
    hint: "Your email. We only use it to reply.",
    error: "Enter a valid email address.",
  },
  name: {
    label: "And your name?",
    hint: "",
    error: "Add your name so we know who to reply to.",
  },
};

const fieldClass =
  "w-full border border-white/20 bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-white/60 focus:border-white";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<StepKey, string>>({ message: "", email: "", name: "" });
  const [problem, setProblem] = useState("");
  const [company, setCompany] = useState(""); // honeypot, real visitors never fill it
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const moved = useRef(false);

  const key = STEPS[step];
  const last = step === STEPS.length - 1;
  const prompt = PROMPTS[key];

  // Focus the new question after a step change, never on first paint (that would scroll the page).
  useEffect(() => {
    if (moved.current) field.current?.focus({ preventScroll: true });
  }, [step]);

  function check(k: StepKey) {
    const v = values[k].trim();
    if (k === "message" && v.length < 3) return PROMPTS.message.error;
    if (k === "email" && !EMAIL_RE.test(v)) return PROMPTS.email.error;
    if (k === "name" && v.length < 2) return PROMPTS.name.error;
    return "";
  }

  async function send() {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setValues({ message: "", email: "", name: "" });
      setStep(0);
    } catch {
      setStatus("error");
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const msg = check(key);
    setProblem(msg);
    if (msg) return;
    if (!last) {
      moved.current = true;
      setStep(step + 1);
      return;
    }
    send();
  }

  function onChange(v: string) {
    setValues((cur) => ({ ...cur, [key]: v }));
    if (problem) setProblem("");
    if (status === "error") setStatus("idle");
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={status === "loading"} className="flex flex-col gap-5">
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
      />
      {status !== "ok" && (
        <>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/70" aria-hidden="true">
            <span className="font-stencil">
              {step + 1} of {STEPS.length}
            </span>
            <span className="h-[2px] flex-1 bg-white/15">
              <span
                className="block h-full origin-left bg-accent transition-transform duration-500 motion-reduce:transition-none"
                style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }}
              />
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="contact-step" className="font-stencil text-xl uppercase leading-tight">
              {prompt.label}
            </label>
            {key === "message" ? (
              <textarea
                key={key}
                id="contact-step"
                ref={field as unknown as React.RefObject<HTMLTextAreaElement>}
                value={values.message}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  // Enter moves on, Shift+Enter writes a new line.
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                aria-describedby="contact-step-note"
                rows={4}
                className={fieldClass}
              />
            ) : (
              <input
                key={key}
                id="contact-step"
                ref={field}
                value={values[key]}
                onChange={(e) => onChange(e.target.value)}
                type={key === "email" ? "email" : "text"}
                inputMode={key === "email" ? "email" : "text"}
                autoComplete={key === "email" ? "email" : "name"}
                aria-describedby="contact-step-note"
                className={fieldClass}
              />
            )}
            <p
              id="contact-step-note"
              role={problem ? "alert" : undefined}
              className={`min-h-[1.5em] text-sm ${problem ? "text-red-400" : "text-white/70"}`}
            >
              {problem || prompt.hint}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              type="submit"
              disabled={status === "loading"}
              className="min-h-[52px] rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-50"
            >
              {status === "loading" ? "Sending…" : last ? "Send" : "Next"}
            </button>
            {step > 0 && (
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => {
                  moved.current = true;
                  setProblem("");
                  setStep(step - 1);
                }}
                className="min-h-[44px] text-sm text-white/80 underline underline-offset-4"
              >
                Back
              </button>
            )}
          </div>
        </>
      )}
      {status === "ok" && <p className="text-sm text-accent">Thank you! Your message has been received.</p>}
      {status === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Email us directly at contact@xstaticfit.com.</p>
      )}
    </form>
  );
}
