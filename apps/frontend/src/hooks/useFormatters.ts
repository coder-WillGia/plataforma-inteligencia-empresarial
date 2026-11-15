export function formatPEN(amount: number | undefined | null): string {
  const num = Number(amount || 0);
  return `S/ ${num.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatNumber(val: number | undefined | null, decimals = 0): string {
  const num = Number(val || 0);
  return num.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPct(val: number | undefined | null, decimals = 1): string {
  const num = Number(val || 0);
  return `${num.toFixed(decimals)}%`;
}
