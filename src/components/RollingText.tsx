"use client";

export default function RollingText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const chars = children.split("");

  return (
    <span className={`group/roll relative inline-block overflow-hidden ${className}`}>
      <span className="flex">
        {chars.map((char, i) => (
          <span key={i} className="inline-block h-[1em] overflow-hidden">
            <span
              className="flex flex-col transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/roll:-translate-y-1/2"
              style={{
                transitionDuration: "600ms",
                transitionDelay: `${i * 22}ms`,
              }}
            >
              <span className="block leading-[1em]">{char === " " ? " " : char}</span>
              <span className="block leading-[1em]" aria-hidden>
                {char === " " ? " " : char}
              </span>
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
