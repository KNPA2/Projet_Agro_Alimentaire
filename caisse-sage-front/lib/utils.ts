import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind (utilitaire standard de shadcn/ui). */
export function cn(...entrees: ClassValue[]) {
  return twMerge(clsx(entrees));
}
