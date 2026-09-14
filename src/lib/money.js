export const parseBRLMoney = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/[R$]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
};

export const formatBRLMoney = (value, options = {}) => (
  (Number(value) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  })
);

export const formatCompactBRL = (value) => {
  const number = Number(value) || 0;
  const abs = Math.abs(number);
  const sign = number < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}R$ ${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}R$ ${(abs / 1000).toFixed(0)}k`;
  return formatBRLMoney(number, { maximumFractionDigits: 0 });
};
