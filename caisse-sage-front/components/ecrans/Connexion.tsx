"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Champ, Input } from "@/components/ui/input";
import { ACCUEIL } from "@/components/app/Coquille";
import { useDonnees } from "@/lib/store";

/** Écran 01 — Connexion. */
export default function Connexion() {
  const { connecter, d } = useDonnees();
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");

  function envoyer(e: FormEvent) {
    e.preventDefault();
    const probleme = connecter(login, mdp);
    if (probleme) { setErreur(probleme); return; }
    const u = d.utilisateurs.find((x) => x.login.toLowerCase() === login.trim().toLowerCase())!;
    router.replace(ACCUEIL[u.role]);
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-sidebar p-4">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-white/5" />
      <form onSubmit={envoyer} className="relative w-full max-w-sm rounded-2xl bg-card p-7 shadow-2xl">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-base font-bold text-white">C</span>
        <h1 className="mt-4 text-xl font-semibold">Connexion</h1>
        <p className="text-xs text-muted-foreground">Caisse connectée à Sage 100c</p>
        <div className="mt-6 flex flex-col gap-4">
          <Champ label="Identifiant *"><Input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" placeholder="a.traore" required /></Champ>
          <Champ label="Mot de passe *" erreur={erreur}><Input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" required aria-invalid={Boolean(erreur)} /></Champ>
          <Button type="submit" size="lg" className="mt-2 w-full">Se connecter</Button>
        </div>
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
          Comptes propres à l'application, indépendants des utilisateurs Sage.<br />Rôles : caissier · responsable · administrateur
        </p>
        <div className="mt-4 rounded-lg bg-muted p-3 text-[11px] text-muted-foreground">
          <b className="text-foreground">Démo</b> (mot de passe <code>demo</code>) :{" "}
          {["a.traore", "m.bamba", "admin"].map((l, i) => (
            <button key={l} type="button" className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline" onClick={() => { setLogin(l); setMdp("demo"); }}>{l}{i < 2 ? ", " : ""}</button>
          ))}
        </div>
      </form>
    </div>
  );
}
