"use client";

import { Coquille } from "@/components/app/Coquille";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dateHeure } from "@/lib/format";
import { useDonnees } from "@/lib/store";

/** Journal d'audit : qui a fait quoi et quand. */
export default function AdminAudit() {
  const { d } = useDonnees();
  return (
    <Coquille titre="Journal d'audit">
      <Card><CardContent className="pt-5">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Utilisateur</TableHead><TableHead>Action</TableHead><TableHead>Objet</TableHead></TableRow></TableHeader>
          <TableBody>{d.audit.map((a, i) => <TableRow key={i}><TableCell className="text-xs">{dateHeure(a.date)}</TableCell><TableCell className="font-mono text-xs">{a.utilisateur}</TableCell><TableCell>{a.action}</TableCell><TableCell className="text-xs text-muted-foreground">{a.objet}</TableCell></TableRow>)}</TableBody>
        </Table>
      </CardContent></Card>
    </Coquille>
  );
}
