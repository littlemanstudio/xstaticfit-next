export default function Eyebrow({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "center" | "left";
}) {
  if (align === "left") {
    return (
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[3px] text-white">
        <span className="h-px w-8 bg-[#555]" />
        {children}
      </div>
    );
  }
  return <div className="eyebrow">{children}</div>;
}
