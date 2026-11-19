import test from "node:test";
import assert from "node:assert/strict";
import { donneesInitiales } from "./donnees.ts";
import { numeroInterne, operationsDe, rapprochement, totalComptage, totaux, verifierCloture, verifierMouvement, verifierReglement } from "./regles.ts";
import { ligneFCreglement } from "./sage.ts";

const d = donneesInitiales();
const nature = (id: string) => d.natures.find((n) => n.id === id)!;

test("numéro interne CAI-AAAA-NNNNNN", () => {
  assert.equal(numeroInterne(2026, 123), "CAI-2026-000123");
});

test("solde théorique = fond + entrées − sorties", () => {
  const j = d.journees.find((x) => x.id === "j4")!;
  const t = totaux(j, operationsDe(d, "j4"));
  assert.deepEqual([t.entrees, t.sorties, t.soldeTheorique], [485000, 120000, 707000]);
});

test("une sortie ne peut pas rendre le solde négatif", () => {
  const ok = { sens: "sortie" as const, nature: nature("depense"), compte: "606400", montant: 35000, libelle: "Achat", justificatif: "f.jpg" };
  assert.deepEqual(verifierMouvement(ok, 615000), {});
  assert.match(verifierMouvement({ ...ok, montant: 700000 }, 615000).montant, /négatif/);
});

test("justificatif obligatoire pour une dépense, compte limité à la nature", () => {
  const e = verifierMouvement({ sens: "sortie", nature: nature("depense"), compte: "521000", montant: 1000, libelle: "x", justificatif: null }, 9e9);
  assert.ok(e.justificatif && e.compte);
  assert.deepEqual(verifierMouvement({ sens: "entree", nature: nature("apport"), compte: "455000", montant: 1000, libelle: "x", justificatif: null }, 0), {});
});

test("règlement : client, mode et montant entier positif", () => {
  assert.equal(Object.keys(verifierReglement({ clientCode: null, modeId: null, montant: 0 })).length, 3);
  assert.deepEqual(verifierReglement({ clientCode: "CLI0042", modeId: "esp", montant: 150000 }), {});
  assert.ok(verifierReglement({ clientCode: "CLI0042", modeId: "esp", montant: 10.5 }).montant);
});

test("clôture : comptage FCFA et commentaire obligatoire si écart", () => {
  assert.equal(totalComptage({ B10000: 40, B5000: 25, B2000: 20, B1000: 5, B500: 6, P500: 20, P250: 4, P200: 4, P100: 6, P50: 3 }), 585550);
  assert.ok(verifierCloture(3000, "").commentaire);
  assert.deepEqual(verifierCloture(3000, "Monnaie rendue en trop"), {});
  assert.deepEqual(verifierCloture(0, ""), {});
});

test("rapprochement des trois totaux", () => {
  assert.equal(rapprochement(operationsDe(d, "j1")).egaux, true);
  const r = rapprochement(operationsDe(d, "j2"));
  assert.equal(r.egaux, false);
  assert.equal(r.ecart, r.application - r.creglement);
});

test("ligne F_CREGLEMENT : valeurs relevées au Profiler", () => {
  const v = (op: string, col: string) => ligneFCreglement(d, d.operations.find((o) => o.id === op)!).find((c) => c.colonne === col)!.valeur;
  const reglement = d.operations.find((o) => o.type === "reglement")!.id;
  const depense = d.operations.find((o) => o.natureId === "depense")!.id;
  assert.deepEqual([v(reglement, "RG_Type"), v(reglement, "RG_TypeReg")], ["0", "0"]);
  assert.deepEqual([v(depense, "RG_Type"), v(depense, "RG_TypeReg"), v(depense, "RG_Montant")], ["2", "4", "35000"]);
});
