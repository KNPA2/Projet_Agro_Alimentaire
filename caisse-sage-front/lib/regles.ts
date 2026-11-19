/**
 * Règles métier du cahier des charges, sans interface : faciles à tester et à
 * reprendre côté serveur (AdonisJS).
 */
import type { Donnees, Journee, Operation, Nature } from "./types.ts";

/** Billets et pièces FCFA utilisés pour le comptage de clôture. */
export const BILLETS = [10000, 5000, 2000, 1000, 500];
export const PIECES = [500, 250, 200, 100, 50, 25, 10, 5];
export const COUPURES = [...BILLETS.map((v) => `B${v}`), ...PIECES.map((v) => `P${v}`)];
export const valeurCoupure = (c: string) => Number(c.slice(1));

export function operationsDe(d: Donnees, journeeId: string): Operation[] {
  return d.operations.filter((o) => o.journeeId === journeeId);
}

export function totaux(journee: Journee, ops: Operation[]) {
  const entrees = ops.filter((o) => o.sens === "entree").reduce((s, o) => s + o.montant, 0);
  const sorties = ops.filter((o) => o.sens === "sortie").reduce((s, o) => s + o.montant, 0);
  const soldeTheorique = journee.fondOuverture + entrees - sorties;
  const ecart = journee.montantCompte === null ? null : journee.montantCompte - soldeTheorique;
  return { entrees, sorties, soldeTheorique, ecart, nbEntrees: ops.filter((o) => o.sens === "entree").length, nbSorties: ops.filter((o) => o.sens === "sortie").length };
}

/** Total compté à partir des quantités par coupure. */
export function totalComptage(comptage: Record<string, number>): number {
  return Object.entries(comptage).reduce((s, [c, q]) => s + valeurCoupure(c) * (Number.isFinite(q) ? q : 0), 0);
}

/** Numéro interne de l'application : CAI-AAAA-NNNNNN. */
export function numeroInterne(annee: number, n: number): string {
  return `CAI-${annee}-${String(n).padStart(6, "0")}`;
}

export interface Erreurs { [champ: string]: string }

/** Contrôles d'un règlement client avant enregistrement. */
export function verifierReglement(v: { clientCode: string | null; modeId: string | null; montant: number }): Erreurs {
  const e: Erreurs = {};
  if (!v.clientCode) e.client = "Choisis un client.";
  if (!v.modeId) e.mode = "Choisis un mode de règlement.";
  if (!Number.isInteger(v.montant) || v.montant <= 0) e.montant = "Le montant doit être un entier positif (FCFA).";
  return e;
}

/** Contrôles d'un mouvement de caisse, dont la règle « le solde ne devient jamais négatif ». */
export function verifierMouvement(
  v: { sens: "entree" | "sortie"; nature: Nature | null; compte: string | null; montant: number; libelle: string; justificatif: string | null },
  soldeActuel: number,
): Erreurs {
  const e: Erreurs = {};
  if (!v.nature) e.nature = "Choisis une nature.";
  if (!v.compte) e.compte = "Choisis un compte de contrepartie.";
  else if (v.nature && !v.nature.comptes.includes(v.compte)) e.compte = "Ce compte n'est pas autorisé pour cette nature.";
  if (!Number.isInteger(v.montant) || v.montant <= 0) e.montant = "Le montant doit être un entier positif (FCFA).";
  if (!v.libelle.trim()) e.libelle = "Le libellé est obligatoire.";
  if (v.nature?.justificatifObligatoire && !v.justificatif) e.justificatif = "La photo du justificatif est obligatoire pour cette nature.";
  if (v.sens === "sortie" && soldeActuel - v.montant < 0) e.montant = "Refusé : cette sortie rendrait le solde théorique négatif.";
  return e;
}

/** Contrôles de la clôture : écart ≠ 0 → commentaire obligatoire. */
export function verifierCloture(ecart: number, commentaire: string): Erreurs {
  return ecart !== 0 && !commentaire.trim() ? { commentaire: "Un écart doit être justifié par un commentaire." } : {};
}

/** Une journée peut-elle être transférée ? Seules les journées validées. */
export const transferable = (j: Journee) => j.statut === "validee";

/**
 * Rapprochement après envoi : trois totaux égaux (application, F_CREGLEMENT, F_ECRITUREC).
 * Les montants des sorties comptent en négatif.
 */
export function rapprochement(ops: Operation[]) {
  const signe = (o: Operation) => (o.sens === "entree" ? o.montant : -o.montant);
  const application = ops.reduce((s, o) => s + signe(o), 0);
  const creglement = ops.filter((o) => o.sage !== null).reduce((s, o) => s + signe(o), 0);
  const ecriturec = ops.filter((o) => o.sage?.ecriture).reduce((s, o) => s + signe(o), 0);
  // Écart affiché : d'abord entre l'application et F_CREGLEMENT, sinon entre F_CREGLEMENT et F_ECRITUREC.
  const ecart = application !== creglement ? application - creglement : creglement - ecriturec;
  return { application, creglement, ecriturec, ecart, egaux: ecart === 0 };
}
