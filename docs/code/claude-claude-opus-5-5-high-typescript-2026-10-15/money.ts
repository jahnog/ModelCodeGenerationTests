declare const centsBrand: unique symbol;

/** A non-negative whole number of cents. Integers avoid floating-point rounding errors. */
export type Cents = number & { readonly [centsBrand]: true };

export function toCents(amount: number): Cents {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`Amount must be a non-negative whole number of cents, got ${amount}.`);
  }
  return amount as Cents;
}

export function multiplyCents(amount: Cents, factor: number): Cents {
  return toCents(amount * factor);
}

export function addCents(a: Cents, b: Cents): Cents {
  return toCents(a + b);
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCents(amount: Cents): string {
  return currencyFormatter.format(amount / 100);
}
