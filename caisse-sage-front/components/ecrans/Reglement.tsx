"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { dateCourte, fcfa, montant } from "@/lib/format";
import { verifierReglement, type Erreurs } from "@/lib/regles";
import { useDonnees, useJourneeCourante } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Operation } from "@/lib/types";

/** Écran 04 — Saisie d'un règlement client. */
export default function Reglement() {
  const { d, caisseId, utilisateur, ajouterOperation } = useDonnees();
  const { journee } = useJourneeCourante();
  const [recherche, setRecherche] = useState("");
  const [client, setClient] = useState<string | null>(null);
  const [mode, setMode] = useState("esp");
  const [somme, setSomme] = useState("");
  const [reference, setReference] = useState("");
  const [libelle, setLibelle] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [cree, setCree] = useState<Operation | null>(null);
  const [recu, setRecu] = useState(false);

  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return q ? d.clients.filter((c) => c.code.toLowerCase().includes(q) || c.nom.toLowerCase().includes(q)).slice(0, 6) : [];
  }, [recherche, d.clients]);
  const nomClient = d.clients.find((c) => c.code === client)?.nom;
  const valeur = Number(somme.replace(/\s/g, ""));

  function enregistrer(imprimer: boolean) {
    const e = verifierReglement({ clientCode: client, modeId: mode, montant: valeur });
    setErreurs(e);
    if (Object.keys(e).length || !journee) return;
    const op = ajouterOperation({ journeeId: journee.id, type: "reglement", sens: "entree", natureId: null, clientCode: client, compte: null, modeId: mode, montant: valeur, libelle: libelle || `Règlement ${nomClient}`, reference, beneficiaire: "", justificatif: null, corrigeId: null });
    setCree(op); setRecu(imprimer);
    setClient(null); setRecherche(""); setSomme(""); setReference(""); setLibelle("");
    if (imprimer) setTimeout(() => window.print(), 50);
  }

  if (!journee) {
    return <Coquille titre="Nouveau règlement client"><Alert variant="attention" titre="Aucune journée ouverte">Ouvre d'abord la journée de cette caisse. <Link className="font-semibold underline" href="/ouverture">Ouvrir la journée</Link></Alert></Coquille>;
  }

  return (
    <Coquille titre="Nouveau règlement client">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader><CardTitle>Saisie du règlement</CardTitle><CardDescription>Champs : caisse, caissier, date, client, mode, montant, référence, libellé</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Champ label="Caisse *"><Input value={d.caisses.find((c) => c.id === caisseId)?.intitule ?? ""} disabled /></Champ>
              <Champ label="Caissier"><Input value={utilisateur?.nom ?? ""} disabled /></Champ>
              <Champ label="Date *"><Input value={dateCourte(journee.date)} disabled /></Champ>
            </div>
            <Champ label="Client (recherche par code ou par nom) *" erreur={erreurs.client}>
              <div className="relative">
                <Input value={client ? `${client} · ${nomClient}` : recherche} onChange={(e) => { setClient(null); setRecherche(e.target.value); }} placeholder="Code ou nom du client" aria-invalid={Boolean(erreurs.client)} />
                <Icone nom="loupe" className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              {!client && resultats.length > 0 && (
                <div className="rounded-md border bg-card shadow-sm">
                  {resultats.map((c) => (
                    <button key={c.code} type="button" onClick={() => { setClient(c.code); setRecherche(""); }} className="flex w-full cursor-pointer gap-6 px-3 py-2 text-left text-sm hover:bg-primary/5">
                      <span className="w-16 font-mono text-xs text-muted-foreground">{c.code}</span>{c.nom}
                    </button>
                  ))}
                </div>
              )}
            </Champ>
            <div className="grid gap-4 sm:grid-cols-3">
              <Champ label="Mode de règlement *" erreur={erreurs.mode}><Select value={mode} onChange={(e) => setMode(e.target.value)}>{d.modes.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}</Select></Champ>
              <Champ label="Montant (FCFA) *" erreur={erreurs.montant}><Input inputMode="numeric" value={somme} onChange={(e) => setSomme(e.target.value.replace(/[^\d\s]/g, ""))} placeholder="150 000" aria-invalid={Boolean(erreurs.montant)} /></Champ>
              <Champ label="Référence (n° chèque, transaction)"><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={mode === "chq" ? "CHQ-0048215" : ""} /></Champ>
            </div>
            <Champ label="Libellé"><Input value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Règlement facture de novembre" /></Champ>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => enregistrer(false)}>Enregistrer</Button>
              <Button variant="outline" onClick={() => enregistrer(true)}><Icone nom="imprimante" />Enregistrer et imprimer le reçu</Button>
              <Link href="/tableau-de-bord"><Button variant="outline">Annuler</Button></Link>
            </div>
            {cree && <Alert variant="succes">Règlement {cree.numeroInterne} enregistré en brouillon ({fcfa(cree.montant)}).{recu && " Le reçu s'imprime."}</Alert>}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Récapitulatif</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {[["Client", nomClient ?? "—"], ["Mode", d.modes.find((m) => m.id === mode)?.libelle ?? "—"], ["Montant", valeur > 0 ? fcfa(valeur) : "—"], ["Statut à l'enregistrement", "Brouillon"], ["N° interne", "attribué à l'enregistrement"]].map(([k, v]) => (
                <div key={k}><p className="text-[11px] text-muted-foreground">{k}</p><p className={cn("font-medium", k === "N° interne" && "text-xs text-muted-foreground")}>{v}</p></div>
              ))}
            </CardContent>
          </Card>
          <Alert variant="attention" titre="À confirmer">
            Imputation sur des factures précises : selon la réponse à la question ouverte 1.<br /><br />Le reçu n'est ni un ticket de caisse ni une facture.
          </Alert>
        </div>
      </div>
      {cree && recu && (
        <div className="recu hidden print:block">
          <h2>Reçu de règlement</h2>
          <p>{cree.numeroInterne} — {dateCourte(journee.date)}</p>
          <p>Client : {d.clients.find((c) => c.code === cree.clientCode)?.nom}</p>
          <p>Montant : {montant(cree.montant)} FCFA — {d.modes.find((m) => m.id === cree.modeId)?.libelle}</p>
          <p>Ce reçu n'est ni un ticket de caisse ni une facture.</p>
        </div>
      )}
    </Coquille>
  );
}
