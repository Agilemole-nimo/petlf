import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border)] bg-white",
        className,
      )}
      {...props}
    />
  );
}
export function PanelHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}
export function PanelTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-display text-base font-bold text-[var(--text)]",
        className,
      )}
      {...props}
    />
  );
}
