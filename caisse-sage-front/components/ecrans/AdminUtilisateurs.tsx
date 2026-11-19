"use client";

import { useState } from "react";
import { Coquille } from "@/components/app/Coquille";
import { Icone } from "@/components/app/Icone";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Champ, Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateCourte, dateHeure } from "@/lib/format";
import { useDonnees } from "@/lib/store";
import type { Role, Utilisateur } from "@/lib/types";

const ROLES: Record<Role, [string, "bleu" | "violet" | "orange"]> = { caissier: ["Caissier", "bleu"], responsable: ["Responsable", "violet"], administrateur: ["Administrateur", "orange"] };
const CAISSIERS_SAGE = [["COL-0002", "Bamba M."], ["COL-0007", "Traoré Awa"], ["COL-0011", "N'Guessan K."], ["COL-0015", "Diallo Y."], ["COL-0021", "Kouassi B."]];

/** Écran 10 — Administration des utilisateurs. */
export default function AdminUtilisateurs() {
  const { d, enregistrerUtilisateur } = useDonnees();
  const [edit, setEdit] = useState<Utilisateur | null>(d.utilisateurs[0] ?? null);
  const [message, setMessage] = useState("");
  const caisses = (u: Utilisateur) => (u.caisses.includes("*") ? "Toutes les caisses" : u.caisses.map((c) => d.caisses.find((x) => x.id === c)?.intitule).join(", ") || "—");

  function nouveau() {
    setMessage("");
    setEdit({ id: `u${Date.now()}`, login: "", nom: "", role: "caissier", caissierSage: null, caisses: [], actif: true, derniereConnexion: null, motDePasse: "demo" });
  }
  function enregistrer() {
    if (!edit || !edit.login.trim() || !edit.nom.trim()) { setMessage("Identifiant et nom obligatoires."); return; }
    enregistrerUtilisateur(edit); setMessage("Enregistré.");
  }

  return (
    <Coquille titre="Administration · Utilisateurs" actions={<Button size="sm" onClick={nouveau}><Icone nom="plus" />Nouvel utilisateur</Button>}>
      <div className="flex flex-col gap-5">
        <Card><CardContent className="pt-5">
          <Table>
            <TableHeader><TableRow><TableHead>Identifiant</TableHead><TableHead>Nom</TableHead><TableHead>Rôle</TableHead><TableHead>Caissier Sage lié</TableHead><TableHead>Caisses autorisées</TableHead><TableHead>Actif</TableHead><TableHead>Dernière connexion</TableHead></TableRow></TableHeader>
            <TableBody>
              {d.utilisateurs.map((u) => (
                <TableRow key={u.id} data-actif={edit?.id === u.id} className="cursor-pointer" onClick={() => { setEdit(structuredClone(u)); setMessage(""); }}>
                  <TableCell className="font-mono text-xs">{u.login}</TableCell><TableCell>{u.nom}</TableCell><TableCell><Badge variant={ROLES[u.role][1]}>{ROLES[u.role][0]}</Badge></TableCell>
                  <TableCell className="text-xs">{u.caissierSage ? `${u.caissierSage} · ${CAISSIERS_SAGE.find((c) => c[0] === u.caissierSage)?.[1] ?? ""}` : "—"}</TableCell>
                  <TableCell className="text-xs">{u.role === "administrateur" ? "—" : caisses(u)}</TableCell>
                  <TableCell><Badge variant={u.actif ? "vert" : "gris"}>{u.actif ? "Oui" : "Non"}</Badge></TableCell>
                  <TableCell className="text-xs">{u.derniereConnexion ? dateCourte(u.derniereConnexion) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {edit && (
            <Card>
              <CardHeader><CardTitle>{edit.nom ? `Modifier : ${edit.nom}` : "Nouvel utilisateur"}</CardTitle><CardDescription>Chaque utilisateur est lié à un caissier Sage et à une ou plusieurs caisses autorisées.</CardDescription></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Champ label="Identifiant"><Input value={edit.login} onChange={(e) => setEdit({ ...edit, login: e.target.value })} /></Champ>
                  <Champ label="Nom"><Input value={edit.nom} onChange={(e) => setEdit({ ...edit, nom: e.target.value })} /></Champ>
                  <Champ label="Rôle"><Select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })}>{(Object.keys(ROLES) as Role[]).map((r) => <option key={r} value={r}>{ROLES[r][0]}</option>)}</Select></Champ>
                  <Champ label="Caissier Sage lié"><Select value={edit.caissierSage ?? ""} onChange={(e) => setEdit({ ...edit, caissierSage: e.target.value || null })}><option value="">Aucun</option>{CAISSIERS_SAGE.map(([c, n]) => <option key={c} value={c}>{c} · {n}</option>)}</Select></Champ>
                  <Champ label="Caisses autorisées" className="sm:col-span-2">
                    <div className="flex flex-wrap gap-3 rounded-md border px-3 py-2">
                      {d.caisses.map((c) => (
                        <label key={c.id} className="flex items-center gap-1.5 text-sm">
                          <input type="checkbox" className="accent-[var(--color-primary)]" checked={edit.caisses.includes("*") || edit.caisses.includes(c.id)} disabled={edit.caisses.includes("*")} onChange={(e) => setEdit({ ...edit, caisses: e.target.checked ? [...edit.caisses, c.id] : edit.caisses.filter((x) => x !== c.id) })} />{c.intitule}
                        </label>
                      ))}
                      <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={edit.caisses.includes("*")} onChange={(e) => setEdit({ ...edit, caisses: e.target.checked ? ["*"] : [] })} />Toutes</label>
                    </div>
                  </Champ>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={enregistrer}>Enregistrer</Button>
                  <Button variant="outline" onClick={() => setMessage("Démo : un lien de réinitialisation serait envoyé. Le serveur ne stocke que des mots de passe hachés.")}>Réinitialiser le mot de passe</Button>
                  <Button variant="outline" onClick={() => { const u = { ...edit, actif: !edit.actif }; setEdit(u); enregistrerUtilisateur(u); setMessage(u.actif ? "Compte réactivé." : "Compte désactivé (jamais supprimé, pour garder l'historique)."); }}>{edit.actif ? "Désactiver" : "Réactiver"}</Button>
                </div>
                {message && <Alert variant="info">{message}</Alert>}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>Traçabilité</CardTitle><CardDescription>Journal d'audit</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {d.audit.slice(0, 6).map((a, i) => (
                <div key={i} className="text-xs"><p className="text-[10px] text-muted-foreground">{dateHeure(a.date)}</p><p><b>{a.utilisateur}</b> · {a.action}{a.objet ? ` ${a.objet}` : ""}</p></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Coquille>
  );
}
