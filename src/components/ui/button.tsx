import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        lime: "bg-lime text-lime-fg hover:bg-lime-dim",
        ghost: "bg-transparent text-fg hover:bg-elevated",
        outline: "border border-border bg-transparent text-fg hover:bg-elevated",
        muted: "bg-elevated text-fg hover:bg-surface-2",
        danger: "bg-danger text-fg hover:opacity-90",
        faint: "text-muted hover:text-fg hover:bg-elevated",
      },
      size: {
        sm: "h-8 rounded-sm px-2.5 text-2xs",
        md: "h-10 rounded-md px-3 text-sm",
        lg: "h-11 rounded-lg px-4 text-sm",
        icon: "size-11 rounded-md",
        chip: "h-7 rounded-full px-2.5 text-2xs",
      },
    },
    defaultVariants: { variant: "lime", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
