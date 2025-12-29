import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
          variant === "primary"
            ? "bg-ember text-ink shadow-glow hover:translate-y-[-1px]"
            : "border border-white/15 text-white hover:border-white/40",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
