import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 py-32 text-center text-white">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">Lost the trail</h1>
      <p className="mt-4 max-w-sm text-sm text-white/60">
        The page you&rsquo;re looking for doesn&rsquo;t exist. Let&rsquo;s get you back to
        training.
      </p>
      <Link
        href="/"
        className="mt-10 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        Back to Home
      </Link>
    </div>
  );
}
