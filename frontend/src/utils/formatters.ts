export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const percentageFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat('pt-BR');

const compactCurrencyOneDecimalFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const compactCurrencyIntegerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const absoluteValue = Math.abs(safeValue);

  if (absoluteValue >= 1000) {
    const formatter = absoluteValue < 10000 ? compactCurrencyOneDecimalFormatter : compactCurrencyIntegerFormatter;
    const sign = safeValue < 0 ? '-' : '';

    return `${sign}R$ ${formatter.format(absoluteValue / 1000)} mil`;
  }

  return currencyFormatter.format(safeValue);
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function formatPercentage(value: number) {
  return `${percentageFormatter.format(Number.isFinite(value) ? value : 0)}%`;
}

export function toInputDate(value?: string | null) {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
}
