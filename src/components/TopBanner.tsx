export default function TopBanner({ text = "NOW RECEIVING ORDERS!" }: { text?: string }) {
  return (
    <div className="bg-accent text-ink text-center text-[11px] font-stencil font-bold uppercase tracking-[0.2em] py-2">
      {text}
    </div>
  );
}
