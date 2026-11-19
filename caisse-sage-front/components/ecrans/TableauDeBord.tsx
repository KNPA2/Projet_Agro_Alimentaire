"use client";

import Link from "next/link";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Kpi } from "@/components/app/Kpi";
import { StatutJour, StatutOp } from "@/components/app/Statut";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateLongue, fcfa, montant } from "@/lib/format";
import { useDonnees, useJourneeCourante } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Écran 02 — Tableau de bord du caissier. */
export default function TableauDeBord() {
  const { d } = useDonnees();
  const { journee, ops, t } = useJourneeCourante();

  if (!journee || !t) {
    return (
      <Coquille titre="Tableau de bord">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <p className="text-base font-semibold">Aucune journée ouverte sur cette caisse</p>
          <p className="mt-1 text-sm text-muted-foreground">Ouvre la journée pour saisir des règlements et des mouvements.</p>
          <Link href="/ouverture"><Button className="mt-5">Ouvrir la journée</Button></Link>
        </Card>
      </Coquille>
    );
  }

  const nomClient = (code: string | null) => d.clients.find((c) => c.code === code)?.nom;
  const libMode = (id: string | null) => d.modes.find((m) => m.id === id)?.libelle;
  const libNature = (id: string | null) => d.natures.find((n) => n.id === id)?.libelle;

  return (
    <Coquille titre="Tableau de bord">
      <div className="flex flex-col gap-5">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">Journée du {dateLongue(journee.date)} <StatutJour s={journee.statut} /></p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi titre="Fond d'ouverture" valeur={fcfa(journee.fondOuverture)} detail="Repris de la clôture précédente" />
          <Kpi titre="Entrées" valeur={fcfa(t.entrees)} detail={`${t.nbEntrees} opération(s)`} ton="vert" />
          <Kpi titre="Sorties" valeur={fcfa(t.sorties)} detail={`${t.nbSorties} opération(s)`} ton="rouge" />
          <Kpi titre="Solde théorique" valeur={fcfa(t.soldeTheorique)} detail="Ne peut pas devenir négatif" ton="bleu" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/reglement"><Button><Icone nom="plus" />Nouveau règlement</Button></Link>
          <Link href="/mouvement"><Button variant="outline"><Icone nom="plus" />Nouveau mouvement</Button></Link>
          <Link href="/cloture"><Button variant="outline"><Icone nom="cadenas" />Clôturer la caisse</Button></Link>
        </div>
        <Card>
          <CardHeader><CardTitle>Opérations du jour</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>N° interne</TableHead><TableHead>Type</TableHead><TableHead>Libellé / client</TableHead><TableHead>Mode / nature</TableHead><TableHead className="text-right">Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>
                {ops.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucune opération pour l'instant.</TableCell></TableRow>}
                {[...ops].reverse().map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.numeroInterne}</TableCell>
                    <TableCell>{o.type === "reglement" ? "Règlement" : "Mouvement"}</TableCell>
                    <TableCell>{o.type === "reglement" ? nomClient(o.clientCode) : o.libelle}</TableCell>
                    <TableCell>{o.type === "reglement" ? libMode(o.modeId) : libNature(o.natureId)}</TableCell>
                    <TableCell className={cn("text-right font-medium tabular-nums", o.sens === "entree" ? "text-emerald-600" : "text-red-600")}>{o.sens === "entree" ? "+" : "−"} {montant(o.montant)}</TableCell>
                    <TableCell><StatutOp s={o.statut} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Alert variant="info">Les opérations restent en brouillon jusqu'à la validation de la journée par le responsable.</Alert>
      </div>
    </Coquille>
  );
}
