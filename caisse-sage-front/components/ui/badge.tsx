import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantes = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      gris: "bg-slate-100 text-slate-600",
      vert: "bg-emerald-100 text-emerald-700",
      rouge: "bg-red-100 text-red-700",
      orange: "bg-amber-100 text-amber-700",
      violet: "bg-violet-100 text-violet-700",
      bleu: "bg-blue-100 text-blue-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...p }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof variantes>) {
  return <span className={cn(variantes({ variant }), className)} {...p} />;
}
