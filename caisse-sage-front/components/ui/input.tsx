import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const champ = "flex w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-80 aria-[invalid=true]:border-destructive";

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(champ, "h-9 py-1", className)} {...p} />;
}
export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(champ, "min-h-20 py-2", className)} {...p} />;
}
/** Liste déroulante native, au style shadcn. */
export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(champ, "h-9 py-1 pr-8 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_10px_center] bg-no-repeat", className)} {...p} />;
}
export function Label({ className, ...p }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium leading-none text-foreground", className)} {...p} />;
}
/** Champ avec étiquette et message d'erreur. */
export function Champ({ label, erreur, aide, children, className }: { label: string; erreur?: string; aide?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {erreur ? <p className="text-xs font-medium text-destructive">{erreur}</p> : aide ? <p className="text-[11px] text-muted-foreground">{aide}</p> : null}
    </div>
  );
}
