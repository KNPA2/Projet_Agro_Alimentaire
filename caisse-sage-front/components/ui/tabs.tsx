"use client";
import { cn } from "@/lib/utils";

/** Onglets simples au style shadcn. */
export function Tabs<T extends string>({ valeur, onChange, onglets }: { valeur: T; onChange: (v: T) => void; onglets: { id: T; titre: string }[] }) {
  return (
    <div role="tablist" className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground flex-wrap">
      {onglets.map((o) => (
        <button key={o.id} role="tab" aria-selected={valeur === o.id} onClick={() => onChange(o.id)}
          className={cn("inline-flex h-7 items-center rounded-md px-3 text-xs font-medium transition-all cursor-pointer", valeur === o.id ? "bg-background text-foreground shadow-sm" : "hover:text-foreground")}>
          {o.titre}
        </button>
      ))}
    </div>
  );
}
