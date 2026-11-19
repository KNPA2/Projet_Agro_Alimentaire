"use client";

/**
 * État de l'application côté navigateur.
 * En démonstration, les données vivent en mémoire et dans le localStorage.
 * En production, chaque action appellera l'API AdonisJS (même nom, même effet) :
 * les écrans n'auront pas à changer.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { donneesInitiales } from "./donnees.ts";
import { numeroInterne, operationsDe, totaux, totalComptage } from "./regles.ts";
import type { Donnees, Journee, Operation, Utilisateur } from "./types.ts";

const CLE = "caisse-sage-demo-v1";
const CLE_SESSION = "caisse-sage-session-v1";

interface Contexte {
  d: Donnees;
  utilisateur: Utilisateur | null;
  caisseId: string;
  pret: boolean;
  setCaisseId: (id: string) => void;
  connecter: (login: string, motDePasse: string) => string | null;
  deconnecter: () => void;
  ouvrirJournee: (caisseId: string, date: string, fond: number) => void;
  ajouterOperation: (o: Omit<Operation, "id" | "numeroInterne" | "statut" | "erreur" | "creePar" | "creeLe" | "sage">) => Operation;
  cloturer: (journeeId: string, comptage: Record<string, number>, commentaire: string) => void;
  valider: (journeeId: string) => void;
  transferer: (journeeId: string) => { faits: number; deja: number };
  comptabiliser: (journeeId: string) => number;
  enregistrerUtilisateur: (u: Utilisateur) => void;
  enregistrerNature: (id: string, libelle: string, sens: "entree" | "sortie" | "choix", comptes: string[]) => void;
  synchroniser: () => void;
  changerPlanification: (p: Donnees["synchro"]["planification"]) => void;
  reinitialiser: () => void;
}

const Ctx = createContext<Contexte | null>(null);

export function FournisseurDonnees({ children, initial }: { children: ReactNode; initial?: { donnees?: Donnees; utilisateurId?: string } }) {
  const [d, setD] = useState<Donnees>(() => initial?.donnees ?? donneesInitiales());
  const [uid, setUid] = useState<string | null>(initial?.utilisateurId ?? null);
  const [caisseId, setCaisseId] = useState("c1");
  const [pret, setPret] = useState(Boolean(initial));

  // Chargement depuis le navigateur (après le premier rendu, pour rester compatible avec le rendu serveur).
  useEffect(() => {
    if (initial) return;
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) setD(JSON.parse(brut) as Donnees);
      const s = localStorage.getItem(CLE_SESSION);
      if (s) setUid(s);
    } catch { /* stockage indisponible : on garde les données de démo */ }
    setPret(true);
  }, [initial]);

  useEffect(() => {
    if (!pret || initial) return;
    try { localStorage.setItem(CLE, JSON.stringify(d)); } catch { /* ignore */ }
  }, [d, pret, initial]);

  const utilisateur = d.utilisateurs.find((u) => u.id === uid) ?? null;
  const login = utilisateur?.login ?? "?";

  useEffect(() => {
    if (utilisateur && utilisateur.caisses.length && utilisateur.caisses[0] !== "*" && !utilisateur.caisses.includes(caisseId)) setCaisseId(utilisateur.caisses[0]);
  }, [utilisateur, caisseId]);

  const maj = useCallback((f: (x: Donnees) => Donnees) => setD((x) => f(structuredClone(x))), []);
  const tracer = (x: Donnees, action: string, objet: string) => {
    x.audit.unshift({ date: new Date().toISOString(), utilisateur: login, action, objet });
  };

  const valeur = useMemo<Contexte>(() => ({
    d, utilisateur, caisseId, pret, setCaisseId,
    connecter(l, mdp) {
      const u = d.utilisateurs.find((x) => x.login.toLowerCase() === l.trim().toLowerCase());
      if (!u || u.motDePasse !== mdp) return "Identifiant ou mot de passe incorrect.";
      if (!u.actif) return "Ce compte est désactivé.";
      setUid(u.id);
      try { localStorage.setItem(CLE_SESSION, u.id); } catch { /* ignore */ }
      maj((x) => { x.utilisateurs.find((y) => y.id === u.id)!.derniereConnexion = new Date().toISOString(); x.audit.unshift({ date: new Date().toISOString(), utilisateur: u.login, action: "connexion", objet: "" }); return x; });
      return null;
    },
    deconnecter() {
      setUid(null);
      try { localStorage.removeItem(CLE_SESSION); } catch { /* ignore */ }
    },
    ouvrirJournee(cid, date, fond) {
      maj((x) => {
        x.journees.push({ id: `j${Date.now()}`, caisseId: cid, date, fondOuverture: fond, statut: "ouverte", comptage: null, montantCompte: null, commentaire: "", ouvertePar: uid!, valideePar: null, valideeLe: null });
        tracer(x, "ouverture", `${x.caisses.find((c) => c.id === cid)?.intitule} du ${date}`);
        return x;
      });
    },
    ajouterOperation(o) {
      let cree!: Operation;
      maj((x) => {
        x.compteurs.numeroInterne += 1;
        cree = { ...o, id: `o${Date.now()}`, numeroInterne: numeroInterne(new Date().getFullYear(), x.compteurs.numeroInterne), statut: "brouillon", erreur: null, creePar: uid!, creeLe: new Date().toISOString(), sage: null };
        x.operations.push(cree);
        tracer(x, "création", cree.numeroInterne);
        return x;
      });
      return cree;
    },
    cloturer(jid, comptage, commentaire) {
      maj((x) => {
        const j = x.journees.find((y) => y.id === jid)!;
        j.comptage = comptage; j.montantCompte = totalComptage(comptage); j.commentaire = commentaire; j.statut = "cloturee";
        tracer(x, "clôture", `Journée du ${j.date}`);
        return x;
      });
    },
    valider(jid) {
      maj((x) => {
        const j = x.journees.find((y) => y.id === jid)!;
        j.statut = "validee"; j.valideePar = uid; j.valideeLe = new Date().toISOString();
        x.operations.filter((o) => o.journeeId === jid && o.statut === "brouillon").forEach((o) => { o.statut = "validee"; });
        tracer(x, "validation", `Journée du ${j.date}`);
        return x;
      });
    },
    transferer(jid) {
      let faits = 0, deja = 0;
      maj((x) => {
        for (const o of x.operations.filter((y) => y.journeeId === jid)) {
          // Anti-doublon : une opération déjà présente dans Sage n'est jamais réinsérée.
          if (o.sage) { deja += 1; continue; }
          if (o.statut !== "validee" && o.statut !== "erreur") continue;
          x.compteurs.cbMarq += 1; x.compteurs.piece += 1;
          o.sage = { cbMarq: x.compteurs.cbMarq, piece: `RG-${String(x.compteurs.piece).padStart(8, "0")}`, ecriture: null };
          o.statut = "transferee"; o.erreur = null; faits += 1;
        }
        tracer(x, "transfert", `${faits} opération(s), journée ${jid}`);
        return x;
      });
      return { faits, deja };
    },
    comptabiliser(jid) {
      let n = 0;
      maj((x) => {
        for (const o of x.operations.filter((y) => y.journeeId === jid && y.statut === "transferee" && y.sage)) {
          x.compteurs.ecriture += 1;
          o.sage!.ecriture = `EC-${x.compteurs.ecriture}`; o.statut = "comptabilisee"; n += 1;
        }
        tracer(x, "comptabilisation", `${n} opération(s), journée ${jid}`);
        return x;
      });
      return n;
    },
    enregistrerUtilisateur(u) {
      maj((x) => {
        const i = x.utilisateurs.findIndex((y) => y.id === u.id);
        if (i >= 0) x.utilisateurs[i] = u; else x.utilisateurs.push(u);
        tracer(x, i >= 0 ? "modification de droits" : "création d'utilisateur", u.login);
        return x;
      });
    },
    enregistrerNature(id, libelle, sens, comptes) {
      maj((x) => {
        const nat = x.natures.find((y) => y.id === id)!;
        nat.libelle = libelle; nat.sens = sens; nat.comptes = comptes;
        tracer(x, "paramétrage", `Nature « ${libelle} »`);
        return x;
      });
    },
    synchroniser() {
      maj((x) => { x.synchro = { ...x.synchro, derniere: new Date().toISOString(), reussie: true }; tracer(x, "synchronisation", "Référentiels Sage"); return x; });
    },
    changerPlanification(p) {
      maj((x) => { x.synchro.planification = p; return x; });
    },
    reinitialiser() {
      setD(donneesInitiales());
    },
  }), [d, utilisateur, caisseId, pret, uid, login, maj]);

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useDonnees(): Contexte {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDonnees doit être utilisé dans <FournisseurDonnees>.");
  return c;
}

/** La journée en cours (non validée) de la caisse choisie, ou null. */
export function useJourneeCourante(): { journee: Journee | null; ops: Operation[]; t: ReturnType<typeof totaux> | null } {
  const { d, caisseId } = useDonnees();
  const journee = [...d.journees].filter((j) => j.caisseId === caisseId && j.statut === "ouverte").sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
  const ops = journee ? operationsDe(d, journee.id) : [];
  return { journee, ops, t: journee ? totaux(journee, ops) : null };
}
