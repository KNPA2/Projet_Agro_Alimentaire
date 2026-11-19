import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Kpi({ titre, valeur, detail, ton }: { titre: string; valeur: string; detail?: string; ton?: "vert" | "rouge" | "bleu" }) {
  const couleur = ton === "vert" ? "text-emerald-600" : ton === "rouge" ? "text-red-600" : ton === "bleu" ? "text-primary" : "text-foreground";
  return (
    <Card className="p-4">
      <p className="text-[11px] text-muted-foreground">{titre}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", couleur)}>{valeur}</p>
      {detail && <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>}
    </Card>
  );
}
