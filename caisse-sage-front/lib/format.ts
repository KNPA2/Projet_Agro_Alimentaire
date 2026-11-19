const nf = new Intl.NumberFormat("fr-FR");

/** 150000 → « 150 000 » (espace insécable remplacée par une espace simple pour l'affichage). */
export function montant(n: number): string {
  return nf.format(n).replace(/ | /g, " ");
}
export function fcfa(n: number): string {
  return `${montant(n)} FCFA`;
}
export function signe(n: number): string {
  return n > 0 ? `+ ${montant(n)}` : n < 0 ? `− ${montant(-n)}` : "0";
}
/** "2026-11-09" → "09/11/2026" */
export function dateCourte(iso: string): string {
  const [a, m, j] = iso.slice(0, 10).split("-");
  return `${j}/${m}/${a}`;
}
export function dateLongue(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
export function dateHeure(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}
export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function decalerJours(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
