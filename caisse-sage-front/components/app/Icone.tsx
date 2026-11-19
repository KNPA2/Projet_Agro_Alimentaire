/** Petites icônes en SVG (traits de 2 px, style « lucide »), sans dépendance. */
const CHEMINS: Record<string, string> = {
  maison: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  portefeuille: "M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zm14 7h.01",
  fleches: "M7 7h13M7 7l3-3M7 7l3 3M17 17H4m13 0-3-3m3 3-3 3",
  cadenas: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  coche: "M20 6 9 17l-5-5",
  envoyer: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  graphique: "M4 20V10m6 10V4m6 16v-8m6 8H2",
  utilisateurs: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  reglages: "M4 6h10M18 6h2M4 12h4m4 0h8M4 18h12m4 0h0M14 4v4M8 10v4m8 2v4",
  synchro: "M21 12a9 9 0 0 1-15.5 6.3L3 16m0 5v-5h5M3 12a9 9 0 0 1 15.5-6.3L21 8m0-5v5h-5",
  document: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5",
  plus: "M12 5v14M5 12h14",
  imprimante: "M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z",
  attention: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0",
  appareil: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  loupe: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16m10 2-4.3-4.3",
  sortie: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9",
  telecharger: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3",
  livre: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  base: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3m8-3v14c0 1.7-3.6 3-8 3s-8-1.3-8-3V5m16 7c0 1.7-3.6 3-8 3s-8-1.3-8-3",
};

export type NomIcone = keyof typeof CHEMINS;

export function Icone({ nom, className = "h-4 w-4" }: { nom: NomIcone | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={CHEMINS[nom] ?? ""} />
    </svg>
  );
}
