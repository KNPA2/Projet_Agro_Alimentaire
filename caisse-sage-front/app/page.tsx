"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ACCUEIL } from "@/components/app/Coquille";
import { useDonnees } from "@/lib/store";

/** Accueil : envoie vers l'écran du rôle, ou vers la connexion. */
export default function Page() {
  const { utilisateur, pret } = useDonnees();
  const router = useRouter();
  useEffect(() => {
    if (pret) router.replace(utilisateur ? ACCUEIL[utilisateur.role] : "/connexion");
  }, [pret, utilisateur, router]);
  return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Chargement…</div>;
}
