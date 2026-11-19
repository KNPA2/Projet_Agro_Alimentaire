"use client";

import Link from "next/link";
import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { fcfa } from "@/lib/format";
import { verifierMouvement, type Erreurs } from "@/lib/regles";
import { useDonnees, useJourneeCourante } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Sens } from "@/lib/types";

/** Écran 05 — Saisie d'un mouvement de caisse. */
export default function Mouvement() {
  const { d, ajouterOperation } = useDonnees();
  const { journee, t } = useJourneeCourante();
  const [sens, setSens] = useState<Sens>("sortie");
  const [natureId, setNatureId] = useState("depense");
  const [compte, setCompte] = useState("606400");
  const [somme, setSomme] = useState("");
  const [libelle, setLibelle] = useState("");
  const [beneficiaire, setBeneficiaire] = useState("");
  const [justificatif, setJustificatif] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [message, setMessage] = useState("");

  const nature = d.natures.find((n) => n.id === natureId) ?? null;
  const naturesDuSens = d.natures.filter((n) => n.sens === sens || n.sens === "choix");
  const valeur = Number(somme.replace(/\s/g, "")) || 0;
  const solde = t?.soldeTheorique ?? 0;
  const apres = sens === "sortie" ? solde - valeur : solde + valeur;

  function changerSens(s: Sens) {
    setSens(s);
    const premiere = d.natures.find((n) => n.sens === s || n.sens === "choix")!;
    setNatureId(premiere.id); setCompte(premiere.comptes[0]);
  }

  function enregistrer() {
    const e = verifierMouvement({ sens, nature, compte, montant: valeur, libelle, justificatif }, solde);
    setErreurs(e);
    if (Object.keys(e).length || !journee) return;
    const op = ajouterOperation({ journeeId: journee.id, type: "mouvement", sens, natureId, clientCode: null, compte, modeId: null, montant: valeur, libelle, reference: "", beneficiaire, justificatif, corrigeId: null });
    setMessage(`Mouvement ${op.numeroInterne} enregistré en brouillon.`);
    setSomme(""); setLibelle(""); setBeneficiaire(""); setJustificatif(null);
  }

  if (!journee) {
    return <Coquille titre="Nouveau mouvement de caisse"><Alert variant="attention" titre="Aucune journée ouverte">Ouvre d'abord la journée de cette caisse. <Link className="font-semibold underline" href="/ouverture">Ouvrir la journée</Link></Alert></Coquille>;
  }

  return (
    <Coquille titre="Nouveau mouvement de caisse">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader><CardTitle>Saisie du mouvement</CardTitle><CardDescription>Sens, nature, compte de contrepartie, montant, libellé, bénéficiaire, justificatif</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ label="Sens *">
                <div className="grid grid-cols-2 gap-1 rounded-md border p-1">
                  {(["entree", "sortie"] as Sens[]).map((s) => (
                    <button key={s} type="button" onClick={() => changerSens(s)} className={cn("h-7 cursor-pointer rounded text-xs font-medium transition-colors", sens === s ? (s === "entree" ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "text-muted-foreground hover:bg-muted")}>{s === "entree" ? "Entrée" : "Sortie"}</button>
                  ))}
                </div>
              </Champ>
              <Champ label="Nature *" erreur={erreurs.nature} aide="Dépense · apport · retrait · remise en banque · autre">
                <Select value={natureId} onChange={(e) => { setNatureId(e.target.value); setCompte(d.natures.find((n) => n.id === e.target.value)!.comptes[0]); }}>
                  {naturesDuSens.map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)}
                </Select>
              </Champ>
              <Champ label="Compte de contrepartie (comptes autorisés pour la nature) *" erreur={erreurs.compte}>
                <Select value={compte} onChange={(e) => setCompte(e.target.value)}>
                  {nature?.comptes.map((c) => <option key={c} value={c}>{c} · {d.comptes.find((x) => x.numero === c)?.intitule}</option>)}
                </Select>
              </Champ>
              <Champ label="Montant (FCFA) *" erreur={erreurs.montant}><Input inputMode="numeric" value={somme} onChange={(e) => setSomme(e.target.value.replace(/[^\d\s]/g, ""))} placeholder="35 000" aria-invalid={Boolean(erreurs.montant)} /></Champ>
              <Champ label="Libellé *" erreur={erreurs.libelle}><Input value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="Achat de fournitures de bureau" /></Champ>
              <Champ label="Bénéficiaire"><Input value={beneficiaire} onChange={(e) => setBeneficiaire(e.target.value)} placeholder="Papeterie Centrale" /></Champ>
            </div>
            <Champ label={`Photo du justificatif${nature?.justificatifObligatoire ? " * (obligatoire pour une dépense)" : ""}`} erreur={erreurs.justificatif}>
              <label className={cn("flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed p-6 text-center text-xs text-muted-foreground hover:bg-muted/40", erreurs.justificatif && "border-destructive")}>
                <Icone nom="appareil" className="h-6 w-6" />
                <span className="font-medium text-foreground">Glisser la photo ici ou prendre une photo</span>
                {justificatif ? <span className="text-emerald-600">{justificatif} ajouté</span> : <span>JPG, PNG ou PDF</span>}
                <input type="file" accept="image/*,application/pdf" capture="environment" className="sr-only" onChange={(e) => setJustificatif(e.target.files?.[0]?.name ?? null)} />
              </label>
            </Champ>
            <div className="flex gap-2">
              <Button onClick={enregistrer}>Enregistrer</Button>
              <Link href="/tableau-de-bord"><Button variant="outline">Annuler</Button></Link>
            </div>
            {message && <Alert variant="succes">{message}</Alert>}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Contrôle du solde</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div><p className="text-[11px] text-muted-foreground">Solde théorique actuel</p><p className="text-lg font-semibold">{fcfa(solde)}</p></div>
              <div><p className="text-[11px] text-muted-foreground">Ce mouvement</p><p className={cn("text-lg font-semibold", sens === "entree" ? "text-emerald-600" : "text-red-600")}>{sens === "entree" ? "+" : "−"} {fcfa(valeur)}</p></div>
              <div className="border-t pt-3"><p className="text-[11px] text-muted-foreground">Solde après opération</p><p className={cn("text-lg font-semibold", apres < 0 ? "text-red-600" : "text-emerald-600")}>{fcfa(apres)}</p></div>
              <Badge variant={apres < 0 ? "rouge" : "vert"} className="self-start">{apres < 0 ? "Solde < 0 : refusé" : "Solde ≥ 0 : autorisé"}</Badge>
            </CardContent>
          </Card>
          <Alert variant="danger" titre="Règle de gestion">Une sortie ne peut pas rendre le solde théorique de la caisse négatif.</Alert>
        </div>
      </div>
    </Coquille>
  );
}
