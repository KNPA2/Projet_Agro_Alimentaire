"use client";

import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Kpi } from "@/components/app/Kpi";
import { StatutJour } from "@/components/app/Statut";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateCourte, fcfa, montant, signe } from "@/lib/format";
import { operationsDe, totaux } from "@/lib/regles";
import { useDonnees } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Écran 07 — Validation des journées (responsable). */
export default function Validation() {
  const { d, valider } = useDonnees();
  const journees = [...d.journees].sort((a, b) => b.date.localeCompare(a.date) || a.caisseId.localeCompare(b.caisseId));
  const [choisie, setChoisie] = useState<string | null>(journees.find((j) => j.statut === "cloturee")?.id ?? null);

  const ligne = (id: string) => {
    const j = d.journees.find((x) => x.id === id)!;
    const ops = operationsDe(d, id);
    return { j, ops, t: totaux(j, ops), caisse: d.caisses.find((c) => c.id === j.caisseId)!, caissier: d.utilisateurs.find((u) => u.id === j.ouvertePar)?.nom ?? "—" };
  };
  const aValider = journees.filter((j) => j.statut === "cloturee");
  const nonTransferees = journees.filter((j) => j.statut === "validee" && operationsDe(d, j.id).some((o) => !o.sage));
  const avecEcart = aValider.filter((j) => ligne(j.id).t.ecart !== 0);
  const sel = choisie ? ligne(choisie) : null;

  return (
    <Coquille titre="Journées à valider">
      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi titre="À valider" valeur={String(aValider.length)} detail="journées clôturées" ton="bleu" />
          <Kpi titre="Validées, non transférées" valeur={String(nonTransferees.length)} detail="prêtes pour l'étape 1" />
          <Kpi titre="Journées avec écart" valeur={String(avecEcart.length)} detail="commentaire obligatoire" ton={avecEcart.length ? "rouge" : undefined} />
        </div>
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Caisse</TableHead><TableHead>Caissier</TableHead><TableHead className="text-right">Solde théorique</TableHead><TableHead className="text-right">Compté</TableHead><TableHead className="text-right">Écart</TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {journees.map((j) => {
                  const l = ligne(j.id);
                  return (
                    <TableRow key={j.id} data-actif={choisie === j.id} className="cursor-pointer" onClick={() => setChoisie(j.id)}>
                      <TableCell>{dateCourte(j.date)}</TableCell><TableCell>{l.caisse.intitule}</TableCell><TableCell>{l.caissier}</TableCell>
                      <TableCell className="text-right tabular-nums">{montant(l.t.soldeTheorique)}</TableCell>
                      <TableCell className="text-right tabular-nums">{j.montantCompte === null ? "—" : montant(j.montantCompte)}</TableCell>
                      <TableCell className={cn("text-right font-medium tabular-nums", l.t.ecart ? "text-red-600" : "text-emerald-600")}>{l.t.ecart === null ? "—" : signe(l.t.ecart)}</TableCell>
                      <TableCell><StatutJour s={j.statut} /></TableCell>
                      <TableCell className="text-right">{j.statut === "cloturee" && <Button size="sm" onClick={(e) => { e.stopPropagation(); setChoisie(j.id); }}>Contrôler</Button>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {sel && (
          <Card>
            <CardHeader><CardTitle>Journée du {dateCourte(sel.j.date)} · {sel.caisse.intitule}</CardTitle><CardDescription>{sel.j.statut === "cloturee" ? "Revue avant validation" : sel.j.statut === "validee" ? "Journée validée et verrouillée" : "Journée encore ouverte : la clôture doit être faite avant la validation"}</CardDescription></CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-[11px] text-muted-foreground">Entrées</p><p className="font-semibold">{fcfa(sel.t.entrees)}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Sorties</p><p className="font-semibold">{fcfa(sel.t.sorties)}</p></div>
                  <div><p className="text-[11px] text-muted-foreground">Opérations</p><p className="font-semibold">{sel.ops.length} ({sel.ops.filter((o) => o.type === "reglement").length} règlements)</p></div>
                </div>
                <div><p className="text-[11px] text-muted-foreground">Commentaire du caissier sur l'écart</p><p className="text-sm">{sel.j.commentaire ? `« ${sel.j.commentaire} »` : "Aucun (pas d'écart)"}</p></div>
              </div>
              {sel.j.statut === "cloturee" && (
                <Alert variant="violet" titre="Validation = verrouillage">
                  Après validation, plus aucune modification. Les corrections se font par une opération d'annulation ou de correction datée du jour.
                  <Button className="mt-3 w-full" onClick={() => valider(sel.j.id)}><Icone nom="coche" />Valider la journée</Button>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Coquille>
  );
}
