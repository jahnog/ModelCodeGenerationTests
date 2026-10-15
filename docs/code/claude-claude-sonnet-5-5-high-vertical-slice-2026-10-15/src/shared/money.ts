/** Prices are integer cents to avoid floating point drift. */
export type Cents = number;

export const isValidCents = (value: number): value is Cents =>
  Number.isSafeInteger(value) && value >= 0;

export const formatCents = (cents: Cents): string => {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `$${whole}.${fraction}`;
};
