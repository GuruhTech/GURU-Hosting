export const exchangeRates: Record<string, number> = {
  Kenya: 1,
  Nigeria: 3.5,
  USA: 0.02,
  UK: 0.02,
  Europe: 0.02,
  "South Africa": 2,
  Ghana: 0.05,
  Uganda: 3,
};

export const currencySymbols: Record<string, string> = {
  Kenya: "KSh",
  Nigeria: "₦",
  USA: "$",
  UK: "£",
  Europe: "€",
  "South Africa": "R",
  Ghana: "GH₵",
  Uganda: "USh",
};

export function convertGruToLocal(gru: number, country: string) {
  const rate = exchangeRates[country] || 1;
  const symbol = currencySymbols[country] || "KSh";
  return {
    value: gru * rate,
    symbol,
    formatted: `${symbol} ${(gru * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };
}
