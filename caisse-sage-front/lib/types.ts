export type Role = "caissier" | "responsable" | "administrateur";
export type Sens = "entree" | "sortie";
export type StatutJournee = "ouverte" | "cloturee" | "validee";
export type StatutOperation = "brouillon" | "validee" | "transferee" | "comptabilisee" | "erreur";

export interface Utilisateur {
  id: string;
  login: string;
  nom: string;
  role: Role;
  caissierSage: string | null; // code collaborateur Sage
  caisses: string[]; // ids des caisses autorisées ("*" = toutes)
  actif: boolean;
  derniereConnexion: string | null;
  motDePasse: string; // DÉMO UNIQUEMENT : le vrai serveur stocke un hachage
}

export interface Caisse { id: string; intitule: string; journal: string; caNo: number }
export interface Client { code: string; nom: string }
export interface ModeReglement { id: string; libelle: string; nReglement: number }
export interface CompteGeneral { numero: string; intitule: string }

export interface Nature {
  id: string;
  libelle: string;
  sens: Sens | "choix";
  comptes: string[]; // comptes généraux autorisés
  justificatifObligatoire: boolean;
}

export interface Journee {
  id: string;
  caisseId: string;
  date: string; // AAAA-MM-JJ
  fondOuverture: number;
  statut: StatutJournee;
  comptage: Record<string, number> | null; // coupure -> quantité
  montantCompte: number | null;
  commentaire: string;
  ouvertePar: string;
  valideePar: string | null;
  valideeLe: string | null;
}

export interface InfosSage {
  cbMarq: number;
  piece: string; // RG_Piece
  ecriture: string | null; // n° d'écriture comptable après comptabilisation
}

export interface Operation {
  id: string;
  numeroInterne: string; // CAI-AAAA-NNNNNN
  journeeId: string;
  type: "reglement" | "mouvement";
  sens: Sens;
  natureId: string | null;
  clientCode: string | null;
  compte: string | null; // compte de contrepartie (mouvement)
  modeId: string | null;
  montant: number; // FCFA, entier positif
  libelle: string;
  reference: string;
  beneficiaire: string;
  justificatif: string | null; // nom du fichier
  statut: StatutOperation;
  erreur: string | null;
  corrigeId: string | null; // opération d'origine si c'est une correction
  creePar: string;
  creeLe: string;
  sage: InfosSage | null;
}

export interface EntreeAudit { date: string; utilisateur: string; action: string; objet: string }

export interface EtatSynchro {
  derniere: string;
  reussie: boolean;
  planification: "heure" | "jour" | "manuelle";
}

export interface Donnees {
  utilisateurs: Utilisateur[];
  caisses: Caisse[];
  clients: Client[];
  modes: ModeReglement[];
  comptes: CompteGeneral[];
  natures: Nature[];
  journees: Journee[];
  operations: Operation[];
  audit: EntreeAudit[];
  synchro: EtatSynchro;
  compteurs: { numeroInterne: number; cbMarq: number; piece: number; ecriture: number };
}
