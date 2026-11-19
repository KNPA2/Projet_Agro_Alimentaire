import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...p }: HTMLAttributes<HTMLTableElement>) {
  return <div className="relative w-full overflow-x-auto rounded-lg border"><table className={cn("w-full caption-bottom text-sm", className)} {...p} /></div>;
}
export const TableHeader = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead className="bg-muted/60 [&_tr]:border-b" {...p} />;
export const TableBody = ({ className, ...p }: HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...p} />;
export function TableRow({ className, ...p }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b transition-colors hover:bg-muted/40 data-[actif=true]:bg-primary/5", className)} {...p} />;
}
export function TableHead({ className, ...p }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("h-9 px-3 text-left align-middle text-[11px] font-medium text-muted-foreground whitespace-nowrap", className)} {...p} />;
}
export function TableCell({ className, ...p }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-2.5 align-middle whitespace-nowrap", className)} {...p} />;
}
