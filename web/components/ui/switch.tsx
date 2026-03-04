"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked ?? false}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-border bg-muted transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent",
          className,
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform",
            checked ? "translate-x-[1.25rem]" : "translate-x-0.5",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";

