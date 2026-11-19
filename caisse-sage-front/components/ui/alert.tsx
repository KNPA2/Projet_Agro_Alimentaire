import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantes = cva("rounded-lg border p-3.5 text-xs leading-relaxed", {
  variants: {
    variant: {
      info: "border-blue-200 bg-blue-50 text-blue-800",
      attention: "border-amber-200 bg-amber-50 text-amber-800",
      danger: "border-red-200 bg-red-50 text-red-800",
      succes: "border-emerald-200 bg-emerald-50 text-emerald-800",
      violet: "border-violet-200 bg-violet-50 text-violet-800",
    },
  },
  defaultVariants: { variant: "info" },
});

export function Alert({ className, variant, titre, children, ...p }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof variantes> & { titre?: string }) {
  return (
    <div role="alert" className={cn(variantes({ variant }), className)} {...p}>
      {titre && <p className="mb-1 text-[13px] font-semibold">{titre}</p>}
      {children}
    </div>
  );
}
