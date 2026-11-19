"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Icone } from "./Icone";
import { Select } from "@/components/ui/input";
import { useDonnees } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export const MENUS: Record<Role, { href: string; titre: string; icone: string }[]> = {
  caissier: [
    { href: "/tableau-de-bord", titre: "Tableau de bord", icone: "maison" },
    { href: "/reglement", titre: "Règlement client", icone: "portefeuille" },
    { href: "/mouvement", titre: "Mouvement de caisse", icone: "fleches" },
    { href: "/cloture", titre: "Clôture de caisse", icone: "cadenas" },
  ],
  responsable: [
    { href: "/validation", titre: "Journées à valider", icone: "coche" },
    { href: "/transfert", titre: "Transfert et compta", icone: "envoyer" },
    { href: "/rapports", titre: "Rapports", icone: "graphique" },
  ],
  administrateur: [
    { href: "/admin/utilisateurs", titre: "Utilisateurs", icone: "utilisateurs" },
    { href: "/admin/referentiels", titre: "Référentiels et natures", icone: "synchro" },
    { href: "/admin/audit", titre: "Journal d'audit", icone: "document" },
  ],
};
export const ACCUEIL: Record<Role, string> = { caissier: "/tableau-de-bord", responsable: "/validation", administrateur: "/admin/utilisateurs" };
const ROLES: Record<Role, string> = { caissier: "Caissier", responsable: "Responsable", administrateur: "Administrateur" };

/** Barre latérale + barre du haut, communes à tous les écrans après connexion. */
export function Coquille({ titre, children, actions }: { titre: string; children: ReactNode; actions?: ReactNode }) {
  const { utilisateur, pret, d, caisseId, setCaisseId, deconnecter } = useDonnees();
  const chemin = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pret && !utilisateur) router.replace("/connexion");
  }, [pret, utilisateur, router]);

  if (!utilisateur) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Chargement…</div>;

  const caissesVisibles = utilisateur.caisses.includes("*") ? d.caisses : d.caisses.filter((c) => utilisateur.caisses.includes(c.id));
  const minutes = Math.max(0, Math.round((Date.now() - new Date(d.synchro.derniere).getTime()) / 60000));
  const initiales = utilisateur.nom.split(/\s+/).map((m) => m[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-white">C</span>
          <div className="leading-tight"><p className="text-[13px] font-semibold text-white">Caisse connectée</p><p className="text-[10px] text-sidebar-foreground/70">à Sage 100c</p></div>
        </div>
        <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Menu</p>
        <nav className="flex flex-col gap-0.5 px-2">
          {MENUS[utilisateur.role].map((m) => {
            const actif = chemin === m.href || (m.href === "/tableau-de-bord" && chemin === "/ouverture");
            return (
              <Link key={m.href} href={m.href} className={cn("flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors", actif ? "bg-sidebar-accent font-medium text-white" : "hover:bg-white/5 hover:text-white")}>
                <Icone nom={m.icone} />{m.titre}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-white"><span className="h-2 w-2 rounded-full bg-emerald-400" />Fonctionne sans Sage</p>
            <p className="mt-0.5 text-[10px] text-sidebar-foreground/60">Sage n'est lu que pour la synchro</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur md:px-6">
          <h1 className="mr-auto text-[17px] font-semibold tracking-tight">{titre}</h1>
          {utilisateur.role === "caissier" && (
            <Select aria-label="Caisse" className="h-8 w-48 text-xs" value={caisseId} onChange={(e) => setCaisseId(e.target.value)}>
              {caissesVisibles.map((c) => <option key={c.id} value={c.id}>{c.intitule}</option>)}
            </Select>
          )}
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Référentiels synchronisés · il y a {minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`}
          </span>
          {actions}
          <div className="flex items-center gap-2">
            <div className="text-right leading-tight"><p className="text-xs font-semibold">{utilisateur.nom}</p><p className="text-[10px] text-muted-foreground">{ROLES[utilisateur.role]}</p></div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initiales}</span>
            <button onClick={() => { deconnecter(); router.replace("/connexion"); }} className="grid h-8 w-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-muted" title="Se déconnecter" aria-label="Se déconnecter"><Icone nom="sortie" /></button>
          </div>
        </header>
        {/* Menu horizontal sur téléphone */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-sidebar px-2 py-2 md:hidden">
          {MENUS[utilisateur.role].map((m) => (
            <Link key={m.href} href={m.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-sidebar-foreground", chemin === m.href && "bg-sidebar-accent text-white")}><Icone nom={m.icone} className="h-3.5 w-3.5" />{m.titre}</Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
