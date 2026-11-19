"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Textarea } from "@/components/ui/input";
import { dateCourte, fcfa, montant, signe } from "@/lib/format";
import { BILLETS, PIECES, totalComptage, verifierCloture, type Erreurs } from "@/lib/regles";
import { useDonnees, useJourneeCourante } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Écran 06 — Clôture de caisse : comptage par billets et pièces FCFA. */
export default function Cloture() {
  const { cloturer } = useDonnees();
  const { journee, t } = useJourneeCourante();
  const router = useRouter();
  const [quantites, setQuantites] = useState<Record<string, number>>({});
  const [commentaire, setCommentaire] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});

  if (!journee || !t) {
    return <Coquille titre="Clôture de caisse"><Alert variant="attention" titre="Aucune journée ouverte">Il n'y a rien à clôturer sur cette caisse. <Link className="font-semibold underline" href="/tableau-de-bord">Retour au tableau de bord</Link></Alert></Coquille>;
  }

  const compte = totalComptage(quantites);
  const ecart = compte - t.soldeTheorique;

  const ligne = (prefixe: "B" | "P", v: number) => {
    const cle = `${prefixe}${v}`;
    return (
      <div key={cle} className="grid grid-cols-[64px_80px_1fr] items-center gap-3 py-1">
        <span className="text-sm font-medium tabular-nums">{montant(v)}</span>
        <Input className="h-8 text-center" inputMode="numeric" aria-label={`Quantité de ${prefixe === "B" ? "billets" : "pièces"} de ${v}`} value={quantites[cle] ?? ""} onChange={(e) => setQuantites({ ...quantites, [cle]: Number(e.target.value.replace(/\D/g, "")) || 0 })} placeholder="0" />
        <span className="text-right text-sm tabular-nums text-muted-foreground">{montant(v * (quantites[cle] ?? 0))}</span>
      </div>
    );
  };

  function valider() {
    const e = verifierCloture(ecart, commentaire);
    setErreurs(e);
    if (Object.keys(e).length) return;
    cloturer(journee!.id, quantites, commentaire);
    router.push("/tableau-de-bord");
  }

  return (
    <Coquille titre={`Clôture de la journée du ${dateCourte(journee.date)}`}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>Comptage des billets et pièces (FCFA)</CardTitle><CardDescription>Saisir la quantité de chaque coupure</CardDescription></CardHeader>
          <CardContent>
            <div className="grid gap-8 sm:grid-cols-2">
              <div><div className="grid grid-cols-[64px_80px_1fr] gap-3 pb-1 text-[11px] text-muted-foreground"><span>Billets</span><span className="text-center">Quantité</span><span className="text-right">Total</span></div>{BILLETS.map((v) => ligne("B", v))}</div>
              <div><div className="grid grid-cols-[64px_80px_1fr] gap-3 pb-1 text-[11px] text-muted-foreground"><span>Pièces</span><span className="text-center">Quantité</span><span className="text-right">Total</span></div>{PIECES.map((v) => ligne("P", v))}</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm text-muted-foreground">Montant compté</span><span className="text-xl font-semibold tabular-nums">{fcfa(compte)}</span></div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Écart de caisse</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div><p className="text-[11px] text-muted-foreground">Solde théorique</p><p className="text-lg font-semibold">{fcfa(t.soldeTheorique)}</p></div>
              <div><p className="text-[11px] text-muted-foreground">Montant compté</p><p className="text-lg font-semibold">{fcfa(compte)}</p></div>
              <div><p className="text-[11px] text-muted-foreground">Écart</p><p className={cn("text-lg font-semibold", ecart === 0 ? "text-emerald-600" : "text-red-600")}>{signe(ecart)} FCFA</p></div>
              {ecart !== 0 && <Badge variant="rouge" className="self-start">Écart à justifier</Badge>}
              <Champ label={`Commentaire${ecart !== 0 ? " (obligatoire si écart) *" : ""}`} erreur={erreurs.commentaire}>
                <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Monnaie rendue en trop, client Konan" aria-invalid={Boolean(erreurs.commentaire)} />
              </Champ>
            </CardContent>
          </Card>
          <Button size="lg" onClick={valider}><Icone nom="cadenas" />Clôturer la journée</Button>
          <Alert variant="info">Après la clôture, le responsable valide la journée. Elle est alors verrouillée.</Alert>
        </div>
      </div>
    </Coquille>
  );
}
