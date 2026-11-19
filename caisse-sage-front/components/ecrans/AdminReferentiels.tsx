"use client";

import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateHeure } from "@/lib/format";
import { useDonnees } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Donnees } from "@/lib/types";

/** Écran 11 — Synchronisation des référentiels Sage et paramétrage des natures. */
export default function AdminReferentiels() {
  const { d, synchroniser, changerPlanification, enregistrerNature } = useDonnees();
  const [natureId, setNatureId] = useState("depense");
  const nature = d.natures.find((n) => n.id === natureId)!;
  const [libelle, setLibelle] = useState(nature.libelle);
  const [sens, setSens] = useState(nature.sens);
  const [comptes, setComptes] = useState<string[]>(nature.comptes);
  const [message, setMessage] = useState("");

  function choisir(id: string) {
    const n = d.natures.find((x) => x.id === id)!;
    setNatureId(id); setLibelle(n.libelle); setSens(n.sens); setComptes(n.comptes); setMessage("");
  }

  // Tables Sage confirmées au SQL Profiler (sauf mention contraire).
  const referentiels: [string, string, number, boolean][] = [
    ["Caisses", "F_CAISSE", d.caisses.length, true], ["Caissiers", "F_COLLABORATEUR", 9, true], ["Clients", "F_COMPTET", 1284, true],
    ["Journaux", "F_JOURNAUX", 12, true], ["Comptes généraux", "F_COMPTEG", 846, true], ["Modes de règlement", "P_REGLEMENT", d.modes.length, true],
  ];
  const sensBadge = (s: string) => s === "entree" ? <Badge variant="vert">Entrée</Badge> : s === "sortie" ? <Badge variant="rouge">Sortie</Badge> : <Badge variant="gris">Au choix</Badge>;

  return (
    <Coquille titre="Administration · Référentiels et natures de mouvement">
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Synchronisation des référentiels</CardTitle><CardDescription>Lecture seule depuis Sage. Planifiée, ou lancée à la main.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Table>
              <TableHeader><TableRow><TableHead>Référentiel</TableHead><TableHead>Table Sage</TableHead><TableHead className="text-right">Éléments</TableHead></TableRow></TableHeader>
              <TableBody>{referentiels.map(([r, t, n]) => <TableRow key={r}><TableCell>{r}</TableCell><TableCell className="font-mono text-xs">{t}</TableCell><TableCell className="text-right tabular-nums">{n.toLocaleString("fr-FR")}</TableCell></TableRow>)}</TableBody>
            </Table>
            <div><p className="text-[11px] text-muted-foreground">Dernière synchronisation</p><p className="flex items-center gap-2 font-semibold">{dateHeure(d.synchro.derniere)} <Badge variant={d.synchro.reussie ? "vert" : "rouge"}>{d.synchro.reussie ? "Réussie" : "Échec"}</Badge></p></div>
            <Champ label="Planification" className="max-w-56">
              <Select value={d.synchro.planification} onChange={(e) => changerPlanification(e.target.value as Donnees["synchro"]["planification"])}><option value="heure">Toutes les heures</option><option value="jour">Une fois par jour</option><option value="manuelle">Manuelle seulement</option></Select>
            </Champ>
            <Button className="self-start" onClick={synchroniser}><Icone nom="synchro" />Synchroniser maintenant</Button>
            <Alert variant="info">Un élément supprimé ou mis en sommeil dans Sage est marqué inactif, jamais effacé.</Alert>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Natures de mouvement</CardTitle><CardDescription>Chaque nature propose une liste de comptes généraux autorisés.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Table>
              <TableHeader><TableRow><TableHead>Nature</TableHead><TableHead>Sens</TableHead><TableHead>Comptes autorisés</TableHead></TableRow></TableHeader>
              <TableBody>{d.natures.map((n) => <TableRow key={n.id} data-actif={n.id === natureId} className="cursor-pointer" onClick={() => choisir(n.id)}><TableCell>{n.libelle}</TableCell><TableCell>{sensBadge(n.sens)}</TableCell><TableCell className="font-mono text-xs">{n.comptes.join(" · ")}</TableCell></TableRow>)}</TableBody>
            </Table>
            <div className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-semibold">Modifier la nature « {nature.libelle} »</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Champ label="Libellé"><Input value={libelle} onChange={(e) => setLibelle(e.target.value)} /></Champ>
                <Champ label="Sens"><Select value={sens} onChange={(e) => setSens(e.target.value as typeof sens)}><option value="entree">Entrée</option><option value="sortie">Sortie</option><option value="choix">Au choix</option></Select></Champ>
              </div>
              <p className="mb-2 mt-4 text-xs font-medium">Comptes généraux autorisés</p>
              <div className="flex flex-wrap gap-2">
                {d.comptes.map((c) => {
                  const actif = comptes.includes(c.numero);
                  return <button key={c.numero} type="button" onClick={() => setComptes(actif ? comptes.filter((x) => x !== c.numero) : [...comptes, c.numero])} className={cn("cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors", actif ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted")}>{c.numero} {c.intitule}</button>;
                })}
              </div>
              <Button className="mt-4" disabled={!comptes.length || !libelle.trim()} onClick={() => { enregistrerNature(natureId, libelle, sens, comptes); setMessage("Nature enregistrée."); }}>Enregistrer</Button>
              {message && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
            </div>
            <p className="text-[11px] text-muted-foreground">Comptes cités à titre d'exemple : à paramétrer par l'administrateur.</p>
          </CardContent>
        </Card>
      </div>
    </Coquille>
  );
}
