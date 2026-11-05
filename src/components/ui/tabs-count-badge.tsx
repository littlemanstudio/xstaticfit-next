// Reverse engineered from the 21st.dev preview image (retrieval quota was used up that day):
// "Tabs with Count Badge" by coss.com, id 29425, https://21st.dev/@coss.com/components/tabs-count-badge
// Copied from the visual only: rounded track, raised active tab, outlined count badge. Restyled for the dark admin.
"use client";

import { cn } from "@/lib/utils";

export type CountTab<T extends string> = { id: T; label: string; count: number };

export function TabsCountBadge<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: CountTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-white/[0.06] p-[3px]", className)}
    >
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-medium transition-colors",
              active ? "bg-white/[0.13] text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]" : "text-white/45 hover:text-white/75",
            )}
          >
            {t.label}
            <span
              className={cn(
                "min-w-[1.6rem] rounded-md border px-1.5 text-center text-[13px] leading-[1.35rem]",
                active ? "border-white/35 text-white" : "border-white/20 text-white/55",
              )}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
