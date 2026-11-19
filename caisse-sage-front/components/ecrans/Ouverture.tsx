"use client";

import { useRouter } from "next/navigation";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { aujourdhui, dateCourte, montant } from "@/lib/format";
import { useDonnees, useJourneeCourante } from "@/lib/store";

/** Écran 03 — Ouverture de caisse. Le fond est repris du montant compté à la dernière clôture. */
export default function Ouverture() {
  const { d, caisseId, setCaisseId, ouvrirJournee, utilisateur } = useDonnees();
  const { journee } = useJourneeCourante();
  const router = useRouter();
  const date = aujourdhui();
  const precedente = [...d.journees].filter((j) => j.caisseId === caisseId && j.statut !== "ouverte").sort((a, b) => b.date.localeCompare(a.date))[0];
  const fond = precedente?.montantCompte ?? 0;
  const caisses = utilisateur?.caisses.includes("*") ? d.caisses : d.caisses.filter((c) => utilisateur?.caisses.includes(c.id));

  return (
    <Coquille titre="Ouverture de la journée">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>Ouvrir la journée de caisse</CardTitle><CardDescription>Le fond de caisse est repris du montant compté à la dernière clôture.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Caisse *"><Select value={caisseId} onChange={(e) => setCaisseId(e.target.value)}>{caisses.map((c) => <option key={c.id} value={c.id}>{c.intitule}</option>)}</Select></Champ>
              <Champ label="Date de la journée *"><Input value={dateCourte(date)} disabled /></Champ>
              <Champ label="Dernière clôture"><Input value={precedente ? `${dateCourte(precedente.date)} · ${precedente.statut === "validee" ? "validée" : "clôturée"}` : "Aucune"} disabled /></Champ>
              <Champ label="Fond d'ouverture (montant compté)"><Input value={`${montant(fond)} FCFA`} disabled /></Champ>
            </div>
            <Alert variant="info"><span className="flex gap-2"><Icone nom="cadenas" className="mt-0.5 h-4 w-4 shrink-0" />Le fond d'ouverture n'est pas modifiable : il correspond au comptage de la clôture précédente. En cas de désaccord, signaler l'écart au responsable.</span></Alert>
            {journee && <Alert variant="attention">Une journée est déjà ouverte sur cette caisse ({dateCourte(journee.date)}).</Alert>}
            <div className="flex gap-2">
              <Button disabled={Boolean(journee)} onClick={() => { ouvrirJournee(caisseId, date, fond); router.push("/tableau-de-bord"); }}>Ouvrir la journée</Button>
              <Button variant="outline" onClick={() => router.push("/tableau-de-bord")}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Rappels</CardTitle></CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-3 pl-4 text-xs text-muted-foreground marker:text-primary">
              <li>Une journée par caisse et par date.</li>
              <li>Les règlements et mouvements se saisissent ensuite en brouillon.</li>
              <li>Le solde théorique est suivi en continu et ne peut pas devenir négatif.</li>
              <li>La clôture se fait par comptage des billets et pièces FCFA.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Coquille>
  );
}
