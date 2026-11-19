# Caisse connectée à Sage 100c — frontend (Next.js)

Interface de l'application de caisse décrite dans le cahier des charges : les 11 écrans des maquettes,
en Next.js (App Router, TypeScript), Tailwind CSS v4 et composants au style shadcn/ui.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000. Il faut Node.js 20 ou plus récent.

**Comptes de démonstration** (mot de passe `demo`) :

| Identifiant | Rôle | Écrans |
|---|---|---|
| `a.traore` | Caissier | Tableau de bord, ouverture, règlement client, mouvement de caisse, clôture |
| `m.bamba` | Responsable | Journées à valider, transfert et comptabilisation, rapports |
| `admin` | Administrateur | Utilisateurs, référentiels et natures, journal d'audit |

Les données de démonstration sont gardées dans le navigateur (localStorage). Pour repartir de zéro :
vider le stockage du site dans le navigateur.

## Les écrans (chapitre 12 du cahier des charges)

| # | Écran | Route |
|---|---|---|
| 01 | Connexion | `/connexion` |
| 02 | Tableau de bord du caissier | `/tableau-de-bord` |
| 03 | Ouverture de caisse | `/ouverture` |
| 04 | Saisie d'un règlement client | `/reglement` |
| 05 | Saisie d'un mouvement de caisse | `/mouvement` |
| 06 | Clôture de caisse | `/cloture` |
| 07 | Validation des journées | `/validation` |
| 08 | Transfert et comptabilisation | `/transfert` |
| 09 | Rapports journaliers | `/rapports` |
| 10 | Administration — utilisateurs | `/admin/utilisateurs` |
| 11 | Administration — référentiels et natures | `/admin/referentiels` |
| + | Journal d'audit | `/admin/audit` |

## Règles de gestion appliquées (lib/regles.ts, testées)

- Solde théorique = fond d'ouverture + entrées − sorties ; une sortie ne peut pas le rendre négatif.
- Fond d'ouverture repris du montant compté à la clôture précédente, non modifiable.
- Mouvement : compte de contrepartie limité aux comptes autorisés de la nature ; justificatif obligatoire pour une dépense.
- Clôture : comptage par billets et pièces FCFA ; un écart doit être justifié par un commentaire.
- Validation par le responsable : la journée est verrouillée, les opérations passent de « brouillon » à « validée ».
- Cycle de vie : brouillon → validée → transférée → comptabilisée.
- Transfert : seules les journées validées ; une opération déjà présente dans Sage n'est jamais réinsérée.
- Rapprochement : application = F_CREGLEMENT = F_ECRITUREC, sinon l'encadré passe au rouge.
- Numéro interne `CAI-AAAA-NNNNNN` ; le numéro de pièce Sage n'est attribué qu'au transfert.

Tests : `npm test` (Node.js 22.6 ou plus récent).

## Ce qui est simulé

Le frontend fonctionne seul, avec des données de démonstration : **le serveur AdonisJS, la base PostgreSQL
et le connecteur Sage ne sont pas encore écrits.** En particulier :

- La connexion vérifie un mot de passe de démo en clair. Le serveur devra gérer les sessions et des mots de passe hachés.
- Le transfert et la comptabilisation sont simulés dans le navigateur.
- L'écran 08 montre, pour chaque opération, la ligne F_CREGLEMENT que le transfert écrira, avec les valeurs
  relevées au SQL Profiler (`lib/sage.ts`). Les valeurs encore incertaines sont marquées « à confirmer ».

Pour brancher le serveur : remplacer les actions de `lib/store.tsx` (connecter, ajouterOperation, cloturer,
valider, transferer, comptabiliser…) par des appels à l'API AdonisJS. Les écrans n'ont pas à changer.

## Organisation

| Dossier | Contenu |
|---|---|
| `app/` | Routes Next.js (une page par écran) |
| `components/ecrans/` | Les écrans |
| `components/app/` | Coquille (menu latéral, barre du haut), icônes, indicateurs, statuts |
| `components/ui/` | Composants au style shadcn/ui : Button, Card, Input, Select, Badge, Table, Alert, Tabs |
| `lib/` | Types, règles de gestion, données de démo, état de l'application, ligne F_CREGLEMENT |

`components.json` permet d'ajouter d'autres composants shadcn/ui avec `npx shadcn@latest add …`.
