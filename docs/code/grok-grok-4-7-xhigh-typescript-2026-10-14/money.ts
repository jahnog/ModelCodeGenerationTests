import { type Brand } from "./brand";
import { CartProblem, type CartError } from "./cart-error";
import { err, ok, type Result } from "./result";

/** Non-negative integer number of cents. */
export type Cents = Brand<number, "Cents">;

/** Positive integer quantity of one cart line. */
export type Quantity = Brand<number, "Quantity">;

/** Validated values are branded here. The cast does not validate again. */
function trustedCents(value: number): Cents {
  return value as Cents;
}

function trustedQuantity(value: number): Quantity {
  return value as Quantity;
}

export const zeroCents: Cents = trustedCents(0);

export function parseCents(value: number): Result<Cents, CartError> {
  const parsed = nonNegativeInteger(value);
  if (parsed === undefined) {
    return err({ kind: CartProblem.invalidPrice });
  }
  return ok(trustedCents(parsed));
}

export function parseQuantity(value: number): Result<Quantity, CartError> {
  const parsed = nonNegativeInteger(value);
  if (parsed === undefined || parsed < 1) {
    return err({ kind: CartProblem.invalidQuantity });
  }
  return ok(trustedQuantity(parsed));
}

export function addQuantities(left: Quantity, right: Quantity): Result<Quantity, CartError> {
  const sum = left + right;
  if (!Number.isSafeInteger(sum) || sum < 1) {
    return err({ kind: CartProblem.quantityOverflow });
  }
  return ok(trustedQuantity(sum));
}

export function multiplyCents(price: Cents, count: Quantity): Result<Cents, CartError> {
  const product = price * count;
  if (!Number.isSafeInteger(product) || product < 0) {
    return err({ kind: CartProblem.lineTotalOverflow });
  }
  return ok(trustedCents(product));
}

export function sumCents(values: readonly Cents[]): Result<Cents, CartError> {
  let total = 0;
  for (const value of values) {
    total += value;
    if (!Number.isSafeInteger(total) || total < 0) {
      return err({ kind: CartProblem.totalOverflow });
    }
  }
  return ok(trustedCents(total === 0 ? 0 : total));
}

export function formatCents(value: Cents): string {
  const dollars = Math.trunc(value / 100);
  const remainder = value % 100;
  return `$${String(dollars)}.${String(remainder).padStart(2, "0")}`;
}

function nonNegativeInteger(value: number): number | undefined {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    return undefined;
  }
  return value === 0 ? 0 : value;
}
