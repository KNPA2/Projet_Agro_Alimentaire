"use client";

import { useMemo, useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Kpi } from "@/components/app/Kpi";
import { StatutOp } from "@/components/app/Statut";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { dateCourte, fcfa, montant, signe } from "@/lib/format";
import { operationsDe, totaux } from "@/lib/regles";
import { useDonnees } from "@/lib/store";
import { cn } from "@/lib/utils";

type Onglet = "journal" | "detail" | "nature" | "mode" | "transfert";

/** Écran 09 — Rapports journaliers, filtres et exports. */
export default function Rapports() {
  const { d } = useDonnees();
  const dates = d.journees.map((j) => j.date).sort();
  const [du, setDu] = useState(dates[0] ?? "");
  const [au, setAu] = useState(dates[dates.length - 1] ?? "");
  const [caisse, setCaisse] = useState("*");
  const [caissier, setCaissier] = useState("*");
  const [onglet, setOnglet] = useState<Onglet>("journal");

  const journees = useMemo(() => d.journees
    .filter((j) => j.date >= du && j.date <= au && (caisse === "*" || j.caisseId === caisse) && (caissier === "*" || j.ouvertePar === caissier))
    .sort((a, b) => b.date.localeCompare(a.date) || a.caisseId.localeCompare(b.caisseId)), [d.journees, du, au, caisse, caissier]);
  const lignes = journees.map((j) => ({ j, ops: operationsDe(d, j.id), t: totaux(j, operationsDe(d, j.id)) }));
  const ops = lignes.flatMap((l) => l.ops);
  const somme = (f: (l: (typeof lignes)[number]) => number) => lignes.reduce((s, l) => s + f(l), 0);
  const ouverture = somme((l) => l.j.fondOuverture), entrees = somme((l) => l.t.entrees), sorties = somme((l) => l.t.sorties);
  const comptes = lignes.filter((l) => l.j.montantCompte !== null);
  const compte = comptes.reduce((s, l) => s + (l.j.montantCompte ?? 0), 0);
  const ecart = comptes.reduce((s, l) => s + (l.t.ecart ?? 0), 0);
  const nomCaisse = (id: string) => d.caisses.find((c) => c.id === id)?.intitule.split(" · ")[0] ?? id;

  function exporterCsv() {
    const entete = "Date;Caisse;Ouverture;Entrées;Sorties;Théorique;Compté;Écart";
    const corps = lignes.map((l) => [l.j.date, nomCaisse(l.j.caisseId), l.j.fondOuverture, l.t.entrees, l.t.sorties, l.t.soldeTheorique, l.j.montantCompte ?? "", l.t.ecart ?? ""].join(";"));
    const blob = new Blob(["﻿" + [entete, ...corps].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `journal-de-caisse_${du}_${au}.csv`; a.click();
  }

  const parCle = (cle: (o: (typeof ops)[number]) => string) => {
    const m = new Map<string, { entrees: number; sorties: number; nb: number }>();
    for (const o of ops) { const k = cle(o); const v = m.get(k) ?? { entrees: 0, sorties: 0, nb: 0 }; if (o.sens === "entree") v.entrees += o.montant; else v.sorties += o.montant; v.nb += 1; m.set(k, v); }
    return [...m.entries()];
  };

  return (
    <Coquille titre="Rapports journaliers">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-3">
          <Champ label="Du"><Input type="date" value={du} onChange={(e) => setDu(e.target.value)} className="w-40" /></Champ>
          <Champ label="Au"><Input type="date" value={au} onChange={(e) => setAu(e.target.value)} className="w-40" /></Champ>
          <Champ label="Caisse"><Select className="w-48" value={caisse} onChange={(e) => setCaisse(e.target.value)}><option value="*">Toutes les caisses</option>{d.caisses.map((c) => <option key={c.id} value={c.id}>{c.intitule}</option>)}</Select></Champ>
          <Champ label="Caissier"><Select className="w-44" value={caissier} onChange={(e) => setCaissier(e.target.value)}><option value="*">Tous</option>{d.utilisateurs.filter((u) => u.role === "caissier").map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}</Select></Champ>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Icone nom="telecharger" />Export PDF</Button>
            <Button variant="outline" onClick={exporterCsv}><Icone nom="telecharger" />Export Excel</Button>
          </div>
        </div>
        <Tabs<Onglet> valeur={onglet} onChange={setOnglet} onglets={[{ id: "journal", titre: "Journal de caisse" }, { id: "detail", titre: "Détail des mouvements" }, { id: "nature", titre: "Par nature et par compte" }, { id: "mode", titre: "Règlements par mode" }, { id: "transfert", titre: "État du transfert" }]} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi titre="Solde d'ouverture" valeur={montant(ouverture)} />
          <Kpi titre="Total des entrées" valeur={montant(entrees)} ton="vert" />
          <Kpi titre="Total des sorties" valeur={montant(sorties)} ton="rouge" />
          <Kpi titre="Solde théorique" valeur={montant(ouverture + entrees - sorties)} ton="bleu" />
          <Kpi titre="Montant compté" valeur={montant(compte)} />
          <Kpi titre="Écart" valeur={signe(ecart)} ton={ecart ? "rouge" : "vert"} />
        </div>
        <Card><CardContent className="pt-5">
          {onglet === "journal" && (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Caisse</TableHead><TableHead className="text-right">Ouverture</TableHead><TableHead className="text-right">Entrées</TableHead><TableHead className="text-right">Sorties</TableHead><TableHead className="text-right">Théorique</TableHead><TableHead className="text-right">Compté</TableHead><TableHead className="text-right">Écart</TableHead><TableHead>Transfert</TableHead></TableRow></TableHeader>
              <TableBody>
                {lignes.map(({ j, ops: o, t }) => (
                  <TableRow key={j.id}>
                    <TableCell>{dateCourte(j.date)}</TableCell><TableCell>{nomCaisse(j.caisseId)}</TableCell>
                    {[j.fondOuverture, t.entrees, t.sorties, t.soldeTheorique].map((v, i) => <TableCell key={i} className="text-right tabular-nums">{montant(v)}</TableCell>)}
                    <TableCell className="text-right tabular-nums">{j.montantCompte === null ? "—" : montant(j.montantCompte)}</TableCell>
                    <TableCell className={cn("text-right font-medium tabular-nums", t.ecart ? "text-red-600" : "text-emerald-600")}>{t.ecart === null ? "—" : signe(t.ecart)}</TableCell>
                    <TableCell className="text-xs font-medium text-violet-700">{o.length && o.every((x) => x.sage?.ecriture) ? "T1+T2" : o.some((x) => x.sage) ? "T1" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {onglet === "detail" && (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>N° interne</TableHead><TableHead>Type</TableHead><TableHead>Libellé</TableHead><TableHead className="text-right">Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>{ops.map((o) => <TableRow key={o.id}><TableCell>{dateCourte(d.journees.find((j) => j.id === o.journeeId)!.date)}</TableCell><TableCell className="font-mono text-xs">{o.numeroInterne}</TableCell><TableCell>{o.type === "reglement" ? "Règlement" : "Mouvement"}</TableCell><TableCell>{o.libelle}</TableCell><TableCell className={cn("text-right tabular-nums", o.sens === "entree" ? "text-emerald-600" : "text-red-600")}>{o.sens === "entree" ? "+" : "−"} {montant(o.montant)}</TableCell><TableCell><StatutOp s={o.statut} /></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
          {onglet === "nature" && (
            <Table>
              <TableHeader><TableRow><TableHead>Nature · compte général</TableHead><TableHead className="text-right">Opérations</TableHead><TableHead className="text-right">Entrées</TableHead><TableHead className="text-right">Sorties</TableHead></TableRow></TableHeader>
              <TableBody>{parCle((o) => o.type === "reglement" ? "Règlements clients · 411" : `${d.natures.find((n) => n.id === o.natureId)?.libelle} · ${o.compte}`).map(([k, v]) => <TableRow key={k}><TableCell>{k}</TableCell><TableCell className="text-right">{v.nb}</TableCell><TableCell className="text-right tabular-nums">{montant(v.entrees)}</TableCell><TableCell className="text-right tabular-nums">{montant(v.sorties)}</TableCell></TableRow>)}</TableBody>
            </Table>
          )}
          {onglet === "mode" && (
            <Table>
              <TableHeader><TableRow><TableHead>Mode de règlement</TableHead><TableHead className="text-right">Règlements</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
              <TableBody>{parCle((o) => o.type === "reglement" ? d.modes.find((m) => m.id === o.modeId)?.libelle ?? "?" : "").filter(([k]) => k).map(([k, v]) => <TableRow key={k}><TableCell>{k}</TableCell><TableCell className="text-right">{v.nb}</TableCell><TableCell className="text-right tabular-nums">{fcfa(v.entrees)}</TableCell></TableRow>)}</TableBody>
            </Table>
          )}
          {onglet === "transfert" && (
            <Table>
              <TableHeader><TableRow><TableHead>N° interne</TableHead><TableHead>Statut</TableHead><TableHead>N° de pièce Sage</TableHead><TableHead>Écriture</TableHead><TableHead>Reste à faire</TableHead></TableRow></TableHeader>
              <TableBody>{ops.map((o) => <TableRow key={o.id}><TableCell className="font-mono text-xs">{o.numeroInterne}</TableCell><TableCell><StatutOp s={o.statut} /></TableCell><TableCell className="font-mono text-xs">{o.sage?.piece ?? "—"}</TableCell><TableCell className="font-mono text-xs">{o.sage?.ecriture ?? "—"}</TableCell><TableCell className="text-xs text-muted-foreground">{o.sage?.ecriture ? "Rien" : o.sage ? "Comptabilisation" : o.statut === "brouillon" ? "Validation" : "Transfert"}</TableCell></TableRow>)}</TableBody>
            </Table>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">Légende du transfert : T1 = transféré (F_CREGLEMENT), T2 = comptabilisé (F_ECRITUREC). Export Excel au format CSV (s'ouvre dans Excel).</p>
        </CardContent></Card>
      </div>
    </Coquille>
  );
}
