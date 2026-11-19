"use client";

import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { StatutOp } from "@/components/app/Statut";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateCourte, montant } from "@/lib/format";
import { operationsDe, rapprochement } from "@/lib/regles";
import { ligneFCreglement } from "@/lib/sage";
import { useDonnees } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Écran 08 — Transfert vers Sage et comptabilisation, avec rapprochement des trois totaux. */
export default function Transfert() {
  const { d, transferer, comptabiliser } = useDonnees();
  const validees = [...d.journees].filter((j) => j.statut === "validee").sort((a, b) => b.date.localeCompare(a.date));
  const [jid, setJid] = useState(validees.find((j) => operationsDe(d, j.id).some((o) => o.statut !== "comptabilisee"))?.id ?? validees[0]?.id ?? "");
  const [opId, setOpId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const journee = d.journees.find((j) => j.id === jid);
  const ops = journee ? operationsDe(d, jid) : [];
  const nb = (f: (s: string) => boolean) => ops.filter((o) => f(o.statut)).length;
  const op = ops.find((o) => o.id === opId) ?? null;
  const nomCaisse = (id: string) => d.caisses.find((c) => c.id === id)?.intitule ?? id;
  const libelle = (o: (typeof ops)[number]) => (o.type === "reglement" ? d.clients.find((c) => c.code === o.clientCode)?.nom : o.libelle);
  const enErreur = ops.find((o) => o.statut === "erreur");

  return (
    <Coquille titre="Transfert vers Sage et comptabilisation" actions={<Badge variant="vert" className="hidden sm:inline-flex">Sage joignable</Badge>}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Journée validée :</span>
          <Select className="w-full max-w-72" value={jid} onChange={(e) => { setJid(e.target.value); setOpId(null); setMessage(""); }}>
            {validees.map((j) => <option key={j.id} value={j.id}>{dateCourte(j.date)} · {nomCaisse(j.caisseId)}</option>)}
          </Select>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">1</span>Transfert dans F_CREGLEMENT</CardTitle><CardDescription>Seules les journées validées. Une transaction SQL par opération.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-sm"><div><p className="text-[11px] text-muted-foreground">Prêtes</p><p className="text-lg font-semibold">{nb((s) => s === "validee")}</p></div><div><p className="text-[11px] text-muted-foreground">Transférées</p><p className="text-lg font-semibold">{ops.filter((o) => o.sage).length}</p></div><div><p className="text-[11px] text-muted-foreground">En erreur</p><p className={cn("text-lg font-semibold", nb((s) => s === "erreur") && "text-red-600")}>{nb((s) => s === "erreur")}</p></div></div>
              <Button className="mt-4" disabled={!nb((s) => s === "validee" || s === "erreur")} onClick={() => { const r = transferer(jid); setMessage(`Transfert : ${r.faits} opération(s) insérée(s), ${r.deja} déjà présente(s) dans Sage (aucun doublon).`); }}><Icone nom="envoyer" />Lancer le transfert</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-violet-600 text-xs text-white">2</span>Comptabilisation dans F_ECRITUREC</CardTitle><CardDescription>Pièces équilibrées, contrôlées avant le COMMIT.</CardDescription></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-sm"><div><p className="text-[11px] text-muted-foreground">Transférées</p><p className="text-lg font-semibold">{ops.filter((o) => o.sage).length}</p></div><div><p className="text-[11px] text-muted-foreground">Comptabilisées</p><p className="text-lg font-semibold">{nb((s) => s === "comptabilisee")}</p></div><div><p className="text-[11px] text-muted-foreground">Restantes</p><p className="text-lg font-semibold">{nb((s) => s === "transferee")}</p></div></div>
              <Button className="mt-4 bg-violet-600 hover:bg-violet-700" disabled={!nb((s) => s === "transferee")} onClick={() => { const n = comptabiliser(jid); setMessage(`Comptabilisation : ${n} opération(s) écrite(s) dans F_ECRITUREC.`); }}><Icone nom="livre" />Lancer la comptabilisation</Button>
            </CardContent>
          </Card>
        </div>
        {message && <Alert variant="succes">{message}</Alert>}

        <Card>
          <CardHeader><CardTitle>Opérations de la journée{journee ? ` du ${dateCourte(journee.date)}` : ""}</CardTitle><CardDescription>Clique sur une ligne pour voir la ligne F_CREGLEMENT correspondante.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Table>
              <TableHeader><TableRow><TableHead>N° interne</TableHead><TableHead>Client / libellé</TableHead><TableHead className="text-right">Montant</TableHead><TableHead className="text-right">cbMarq Sage</TableHead><TableHead>N° de pièce Sage</TableHead><TableHead>Écriture</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
              <TableBody>
                {ops.map((o) => (
                  <TableRow key={o.id} data-actif={opId === o.id} className="cursor-pointer" onClick={() => setOpId(o.id)}>
                    <TableCell className="font-mono text-xs">{o.numeroInterne}</TableCell><TableCell>{libelle(o)}</TableCell>
                    <TableCell className="text-right tabular-nums">{o.sens === "sortie" ? "− " : ""}{montant(o.montant)}</TableCell>
                    <TableCell className="text-right tabular-nums">{o.sage?.cbMarq ?? "—"}</TableCell><TableCell className="font-mono text-xs">{o.sage?.piece ?? "—"}</TableCell><TableCell className="font-mono text-xs">{o.sage?.ecriture ?? "—"}</TableCell>
                    <TableCell><StatutOp s={o.statut} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {enErreur && <Alert variant="danger"><span className="flex gap-2"><Icone nom="attention" className="h-4 w-4 shrink-0" />{enErreur.numeroInterne} : {enErreur.erreur} Relancer le transfert : aucun doublon ne sera créé.</span></Alert>}
          </CardContent>
        </Card>

        {op && (
          <Card>
            <CardHeader><CardTitle>Ligne F_CREGLEMENT de {op.numeroInterne}</CardTitle><CardDescription>Valeurs relevées au SQL Profiler. Les lignes marquées « à confirmer » attendent une capture.</CardDescription></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Colonne</TableHead><TableHead>Valeur</TableHead><TableHead>Origine</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ligneFCreglement(d, op).map((c) => (
                    <TableRow key={c.colonne}><TableCell className="font-mono text-xs">{c.colonne}</TableCell><TableCell className="font-mono text-xs">{c.valeur}</TableCell><TableCell className="text-xs text-muted-foreground">{c.origine} {c.aConfirmer && <Badge variant="orange" className="ml-1">à confirmer</Badge>}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold">Rapprochement après chaque envoi</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {validees.map((j) => {
              const r = rapprochement(operationsDe(d, j.id));
              return (
                <div key={j.id} className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border p-4 text-sm [&>*:first-child]:mr-auto", r.egaux ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50")}>
                  <div><p className="font-semibold">{nomCaisse(j.caisseId)} · {dateCourte(j.date)}</p><Badge variant={r.egaux ? "vert" : "rouge"} className="mt-1">{r.egaux ? "Totaux égaux" : `Écart de ${montant(Math.abs(r.ecart))} FCFA`}</Badge></div>
                  {([["Application", r.application], ["F_CREGLEMENT", r.creglement], ["F_ECRITUREC", r.ecriturec]] as const).map(([k, v]) => (
                    <div key={k} className="text-right"><p className="text-[10px] text-muted-foreground">{k}</p><p className={cn("font-semibold tabular-nums", !r.egaux && v !== r.application && "text-red-600")}>{montant(v)}</p></div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <Alert variant="attention">Démo : le transfert et la comptabilisation sont simulés dans le navigateur. En production, ils seront faits par le serveur AdonisJS, une transaction SQL par opération, d'après les fiches de scénario.</Alert>
      </div>
    </Coquille>
  );
}
