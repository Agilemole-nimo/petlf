import { cn } from "@/lib/utils";
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "success" && "bg-emerald-50 text-emerald-800",
        tone === "warning" && "bg-amber-100 text-amber-900",
        tone === "info" && "bg-sky-50 text-sky-800",
        tone === "danger" && "bg-red-50 text-red-800",
        tone === "neutral" && "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
