import { DomainError } from "../error/domain-error";
import type { CartLine } from "../model/cart-line";
import type { ShoppingCart } from "../model/shopping-cart";

export interface CartSummary {
  readonly lines: readonly CartLine[];
  readonly itemCount: number;
  readonly totalCents: number;
}

export function summarizeCart(cart: ShoppingCart): CartSummary {
  const lines = cart.lines();
  let itemCount = 0;
  let totalCents = 0;
  for (const line of lines) {
    const nextCount = itemCount + line.quantity.value;
    const nextTotal = totalCents + line.lineTotalCents();
    if (!Number.isSafeInteger(nextCount) || !Number.isSafeInteger(nextTotal)) {
      throw new DomainError(
        "total-overflow",
        "Cart total is outside the safe integer range.",
      );
    }
    itemCount = nextCount;
    totalCents = nextTotal;
  }
  return { lines, itemCount, totalCents };
}
