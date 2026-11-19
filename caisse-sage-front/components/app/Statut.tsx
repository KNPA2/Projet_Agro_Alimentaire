import { Badge } from "@/components/ui/badge";
import type { StatutJournee, StatutOperation } from "@/lib/types";

const OP: Record<StatutOperation, [string, "gris" | "bleu" | "violet" | "vert" | "rouge"]> = {
  brouillon: ["Brouillon", "gris"], validee: ["Validée", "bleu"], transferee: ["Transférée", "violet"], comptabilisee: ["Comptabilisée", "vert"], erreur: ["Erreur", "rouge"],
};
const JOUR: Record<StatutJournee, [string, "vert" | "orange" | "bleu"]> = {
  ouverte: ["Ouverte", "vert"], cloturee: ["Clôturée", "orange"], validee: ["Validée", "bleu"],
};

export const StatutOp = ({ s }: { s: StatutOperation }) => <Badge variant={OP[s][1]}>{OP[s][0]}</Badge>;
export const StatutJour = ({ s }: { s: StatutJournee }) => <Badge variant={JOUR[s][1]}>{JOUR[s][0]}</Badge>;
