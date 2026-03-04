"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-2", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-base font-semibold", className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function DialogContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-2", className)} {...props} />;
}

export function DialogFooter({
  className,
  onClose,
  children,
}: {
  className?: string;
  onClose?: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)}
    >
      {onClose ? (
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
      ) : null}
      {children}
    </div>
  );
}

