/**
 * Données de démonstration (noms, clients et montants fictifs, comme dans les maquettes).
 * Les dates sont calculées à partir d'aujourd'hui pour que la démo reste cohérente.
 */
import { aujourdhui, decalerJours } from "./format.ts";
import { numeroInterne } from "./regles.ts";
import type { Donnees, Journee, Operation } from "./types.ts";

export function donneesInitiales(): Donnees {
  const j0 = aujourdhui();
  const annee = Number(j0.slice(0, 4));
  const jours = [decalerJours(j0, -3), decalerJours(j0, -1), j0];
  let n = 90;
  let marq = 48200, piece = 51200, ecr = 224400;

  const journees: Journee[] = [];
  const operations: Operation[] = [];

  function journee(id: string, caisseId: string, date: string, fond: number, statut: Journee["statut"], compte: number | null, commentaire = "", ouvertePar = "u1"): string {
    journees.push({ id, caisseId, date, fondOuverture: fond, statut, comptage: null, montantCompte: compte, commentaire, ouvertePar, valideePar: statut === "validee" ? "u3" : null, valideeLe: statut === "validee" ? `${date}T18:10:00` : null });
    return id;
  }
  function op(journeeId: string, type: "reglement" | "mouvement", sens: "entree" | "sortie", montant: number, libelle: string, extra: Partial<Operation> = {}, etape: 0 | 1 | 2 = 0) {
    n += 1;
    const statutJ = journees.find((j) => j.id === journeeId)!.statut;
    const sage = etape >= 1 ? { cbMarq: ++marq, piece: `RG-${String(++piece).padStart(8, "0")}`, ecriture: etape === 2 ? `EC-${++ecr}` : null } : null;
    operations.push({
      id: `o${n}`, numeroInterne: numeroInterne(annee, n), journeeId, type, sens, montant, libelle,
      natureId: null, clientCode: null, compte: null, modeId: null, reference: "", beneficiaire: "", justificatif: null,
      statut: etape === 2 ? "comptabilisee" : etape === 1 ? "transferee" : statutJ === "validee" ? "validee" : "brouillon",
      erreur: null, corrigeId: null, creePar: "u1", creeLe: `${journees.find((j) => j.id === journeeId)!.date}T09:${String(10 + (n % 50)).padStart(2, "0")}:00`, sage,
      ...extra,
    });
  }

  // J-3 : Caisse 01, entièrement envoyée vers Sage
  journee("j1", "c1", jours[0], 280000, "validee", 310000);
  op("j1", "reglement", "entree", 150000, "Règlement facture d'octobre", { clientCode: "CLI0042", modeId: "esp" }, 2);
  op("j1", "reglement", "entree", 80000, "Acompte commande", { clientCode: "CLI0187", modeId: "chq", reference: "CHQ-0047120" }, 2);
  op("j1", "mouvement", "sortie", 200000, "Remise en banque du jour", { natureId: "remise", compte: "521000" }, 2);

  // J-1 : Caisse 01 validée, en partie transférée (une erreur), Caisse 02 clôturée
  journee("j2", "c1", jours[1], 310000, "validee", 342000, "Erreur de rendu monnaie sur le règlement Pharmacie Yao");
  op("j2", "reglement", "entree", 150000, "Ets Konan & Fils", { clientCode: "CLI0042", modeId: "esp" }, 2);
  op("j2", "reglement", "entree", 85000, "Pharmacie Yao", { clientCode: "CLI0300", modeId: "chq", reference: "CHQ-0048102" }, 1);
  op("j2", "mouvement", "sortie", 35000, "Achat fournitures de bureau", { natureId: "depense", compte: "606400", beneficiaire: "Papeterie Centrale", justificatif: "facture_papeterie.jpg" }, 1);
  op("j2", "reglement", "entree", 250000, "SARL Ivoire Négoce", { clientCode: "CLI0512", modeId: "mm", reference: "MM-88231" });
  operations[operations.length - 1].statut = "erreur";
  operations[operations.length - 1].erreur = "Transaction annulée : délai d'attente du verrou dépassé. Aucun numéro perdu, relance possible.";
  op("j2", "mouvement", "sortie", 85000, "Remise en banque", { natureId: "remise", compte: "521000" }, 1);
  op("j2", "mouvement", "sortie", 330000, "Remise en banque complémentaire", { natureId: "remise", compte: "521000" });
  journee("j3", "c2", jours[1], 97000, "cloturee", 97000, "", "u2");
  op("j3", "reglement", "entree", 112500, "Boutique Adjoua", { clientCode: "CLI0099", modeId: "esp", creePar: "u2" });
  op("j3", "mouvement", "sortie", 27000, "Transport marchandises", { natureId: "depense", compte: "625100", beneficiaire: "Taxi", justificatif: "recu_taxi.jpg", creePar: "u2" });
  journees.find((j) => j.id === "j3")!.montantCompte = 182500;

  // Aujourd'hui : Caisse 01 ouverte avec des opérations en brouillon
  journee("j4", "c1", jours[2], 342000, "ouverte", null);
  op("j4", "reglement", "entree", 150000, "Ets Konan & Fils", { clientCode: "CLI0042", modeId: "esp" });
  op("j4", "reglement", "entree", 85000, "Boutique Adjoua", { clientCode: "CLI0099", modeId: "chq", reference: "CHQ-0048215" });
  op("j4", "mouvement", "sortie", 35000, "Achat fournitures de bureau", { natureId: "depense", compte: "606400", beneficiaire: "Papeterie Centrale", justificatif: "facture_papeterie.jpg" });
  op("j4", "reglement", "entree", 250000, "SARL Ivoire Négoce", { clientCode: "CLI0512", modeId: "mm", reference: "MM-90114" });
  op("j4", "mouvement", "sortie", 85000, "Remise en banque", { natureId: "remise", compte: "521000" });

  return {
    utilisateurs: [
      { id: "u1", login: "a.traore", nom: "Awa Traoré", role: "caissier", caissierSage: "COL-0007", caisses: ["c1"], actif: true, derniereConnexion: `${j0}T07:55:00`, motDePasse: "demo" },
      { id: "u2", login: "k.nguessan", nom: "Koffi N'Guessan", role: "caissier", caissierSage: "COL-0011", caisses: ["c2"], actif: true, derniereConnexion: `${jours[1]}T08:02:00`, motDePasse: "demo" },
      { id: "u3", login: "m.bamba", nom: "M. Bamba", role: "responsable", caissierSage: "COL-0002", caisses: ["*"], actif: true, derniereConnexion: `${j0}T08:02:00`, motDePasse: "demo" },
      { id: "u4", login: "admin", nom: "Administrateur", role: "administrateur", caissierSage: null, caisses: [], actif: true, derniereConnexion: `${jours[1]}T17:40:00`, motDePasse: "demo" },
      { id: "u5", login: "y.diallo", nom: "Yasmine Diallo", role: "caissier", caissierSage: "COL-0015", caisses: ["c2"], actif: false, derniereConnexion: null, motDePasse: "demo" },
    ],
    caisses: [
      { id: "c1", intitule: "Caisse 01 · Principale", journal: "CAIS", caNo: 3 },
      { id: "c2", intitule: "Caisse 02 · Boutique", journal: "CAI2", caNo: 4 },
    ],
    clients: [
      { code: "CLI0042", nom: "Ets Konan & Fils" }, { code: "CLI0099", nom: "Boutique Adjoua" },
      { code: "CLI0187", nom: "Konaté Distribution" }, { code: "CLI0231", nom: "Kone Pharmacie" },
      { code: "CLI0300", nom: "Pharmacie Yao" }, { code: "CLI0512", nom: "SARL Ivoire Négoce" },
      { code: "CLI0640", nom: "Deutschland's Bijoux" }, { code: "CLI0721", nom: "Éclat Doré" },
    ],
    modes: [
      { id: "esp", libelle: "Espèces", nReglement: 3 },
      { id: "chq", libelle: "Chèque", nReglement: 1 },
      { id: "vir", libelle: "Virement", nReglement: 2 },
      { id: "mm", libelle: "Mobile money", nReglement: 6 },
    ],
    comptes: [
      { numero: "606400", intitule: "Fournitures administratives" }, { numero: "625100", intitule: "Voyages et déplacements" },
      { numero: "627100", intitule: "Frais bancaires" }, { numero: "455000", intitule: "Associés, comptes courants" },
      { numero: "101000", intitule: "Capital social" }, { numero: "521000", intitule: "Banque" },
      { numero: "585000", intitule: "Virements de fonds" },
    ],
    natures: [
      { id: "depense", libelle: "Dépense", sens: "sortie", comptes: ["606400", "625100", "627100"], justificatifObligatoire: true },
      { id: "apport", libelle: "Apport", sens: "entree", comptes: ["455000", "101000"], justificatifObligatoire: false },
      { id: "retrait", libelle: "Retrait", sens: "sortie", comptes: ["455000"], justificatifObligatoire: false },
      { id: "remise", libelle: "Remise en banque", sens: "sortie", comptes: ["521000", "585000"], justificatifObligatoire: false },
      { id: "autre", libelle: "Autre", sens: "choix", comptes: ["585000", "455000"], justificatifObligatoire: false },
    ],
    journees,
    operations,
    audit: [
      { date: `${j0}T08:02:00`, utilisateur: "m.bamba", action: "connexion", objet: "" },
      { date: `${j0}T07:55:00`, utilisateur: "a.traore", action: "connexion", objet: "" },
      { date: `${jours[1]}T18:10:00`, utilisateur: "m.bamba", action: "validation", objet: `Journée Caisse 01 du ${jours[1]}` },
      { date: `${jours[1]}T17:40:00`, utilisateur: "admin", action: "modification de droits", objet: "y.diallo" },
    ],
    synchro: { derniere: `${j0}T08:00:00`, reussie: true, planification: "heure" },
    compteurs: { numeroInterne: n, cbMarq: marq, piece, ecriture: ecr },
  };
}
