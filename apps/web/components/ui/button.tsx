import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const styles = cva(
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      emphasis: {
        solid: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
        outline:
          "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--surface-muted)]",
        ghost: "text-[var(--text)] hover:bg-[var(--surface-muted)]",
      },
      size: { sm: "min-h-8 px-3 text-xs", md: "min-h-10 px-4" },
    },
    defaultVariants: { emphasis: "solid", size: "md" },
  },
);
type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof styles>;
export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, emphasis, size, onClick, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      className={cn(styles({ emphasis, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
