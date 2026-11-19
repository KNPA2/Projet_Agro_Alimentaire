/**
 * Ligne F_CREGLEMENT que le transfert écrira pour une opération.
 * Valeurs relevées au SQL Profiler (document « Sage_operations_de_caisse », v1.5) :
 *  - RG_Type    : 0 = client, 2 = autres (mouvement de caisse)
 *  - RG_TypeReg : 0 = règlement, 5 = entrée en caisse, 4 = sortie de caisse, 3 = remise en banque
 *  - RG_Montant : toujours positif, le sens est dans RG_TypeReg
 *  - RG_Compta = 0 et EC_No = 0 tant que la comptabilisation n'est pas faite
 * Ce qui reste à confirmer est signalé par « ? ».
 */
import type { Donnees, Operation } from "./types.ts";

export interface ColonneSage { colonne: string; valeur: string; origine: string; aConfirmer?: boolean }

export function ligneFCreglement(d: Donnees, op: Operation): ColonneSage[] {
  const journee = d.journees.find((j) => j.id === op.journeeId)!;
  const caisse = d.caisses.find((c) => c.id === journee.caisseId)!;
  const mode = d.modes.find((m) => m.id === op.modeId);
  const nature = d.natures.find((n) => n.id === op.natureId);
  const remise = nature?.id === "remise";
  const typeReg = op.type === "reglement" ? 0 : remise ? 3 : op.sens === "entree" ? 5 : 4;
  return [
    { colonne: "RG_No", valeur: op.sage ? String(op.sage.cbMarq) : "MAX(RG_No) + 1", origine: "calculé par Sage, sous verrou" },
    { colonne: "RG_Piece", valeur: op.sage?.piece ?? "compteur P_COLREGLEMENT", origine: "CR_Numero01 avant incrément" },
    { colonne: "RG_Type", valeur: op.type === "reglement" ? "0" : "2", origine: op.type === "reglement" ? "client" : "autres (mouvement)" },
    { colonne: "RG_TypeReg", valeur: String(typeReg), origine: ["règlement", "", "", "remise en banque", "sortie de caisse", "entrée en caisse"][typeReg], aConfirmer: remise },
    { colonne: "CT_NumPayeur", valeur: op.clientCode ?? "NULL", origine: op.clientCode ? "client saisi" : "pas de tiers" },
    { colonne: "RG_Date", valeur: journee.date, origine: "date de la journée" },
    { colonne: "RG_Libelle", valeur: op.libelle, origine: "saisi" },
    { colonne: "RG_Reference", valeur: op.numeroInterne, origine: "identifiant anti-doublon de l'application", aConfirmer: true },
    { colonne: "RG_Montant", valeur: String(op.montant), origine: "toujours positif" },
    { colonne: "N_Reglement", valeur: mode ? String(mode.nReglement) : "3", origine: mode ? `mode « ${mode.libelle} » (P_REGLEMENT)` : "valeur relevée sur les mouvements", aConfirmer: true },
    { colonne: "CG_Num", valeur: op.compte ?? "4110000", origine: op.compte ? "compte de contrepartie" : "compte collectif client" },
    { colonne: "JO_Num", valeur: caisse.journal, origine: "journal de la caisse" },
    { colonne: "CA_No", valeur: String(caisse.caNo), origine: "caisse" },
    { colonne: "RG_Ticket", valeur: op.type === "mouvement" ? "1" : "0", origine: "relevé au Profiler" },
    { colonne: "RG_Valide", valeur: op.type === "mouvement" ? "1" : "0", origine: "relevé au Profiler" },
    { colonne: "RG_Impute / RG_Compta / EC_No", valeur: "0 / 0 / 0", origine: "non imputé, non comptabilisé" },
    { colonne: "cbHash", valeur: "?", origine: "empreinte calculée après l'INSERT : formule inconnue", aConfirmer: true },
  ];
}
