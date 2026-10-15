const CENTS_PER_DOLLAR = 100;

export function formatCents(amountInCents: number): string {
  return `$${(amountInCents / CENTS_PER_DOLLAR).toFixed(2)}`;
}
