import { convertGruToLocal } from "@/lib/currency";

export function CurrencyDisplay({ gru, country }: { gru: number; country?: string }) {
  if (!country) return <span>{gru.toLocaleString()} GRU</span>;

  const local = convertGruToLocal(gru, country);

  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-bold text-primary">{gru.toLocaleString()} GRU</span>
      <span className="text-muted-foreground text-sm">({local.formatted})</span>
    </span>
  );
}
