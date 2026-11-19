import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FournisseurDonnees } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caisse connectée à Sage 100c",
  description: "Saisie des règlements clients et des mouvements de caisse, transfert vers Sage 100c.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <FournisseurDonnees>{children}</FournisseurDonnees>
      </body>
    </html>
  );
}
