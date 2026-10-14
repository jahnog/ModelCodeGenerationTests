// Slice: show the items in the shopping cart.
// The line view and the listing live in this file.
// This slice does not import the other slices.

import type { ShoppingCart } from "../shared/shopping-cart";

export interface ShownCartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number | undefined;
}

export interface ShowCartItemsResponse {
  readonly items: readonly ShownCartItem[];
  readonly totalCents: number | undefined;
  readonly listing: string;
}

export function showCartItems(cart: ShoppingCart): ShowCartItemsResponse {
  const items: ShownCartItem[] = [];
  let totalCents = 0;
  let totalIsSafe = true;

  for (const line of cart) {
    const lineTotal = line.quantity * line.unitPriceCents;
    const lineTotalCents = Number.isSafeInteger(lineTotal) ? lineTotal : undefined;
    items.push({
      productId: line.productId,
      name: line.name,
      unitPriceCents: line.unitPriceCents,
      quantity: line.quantity,
      lineTotalCents,
    });

    if (lineTotalCents === undefined) {
      totalIsSafe = false;
      continue;
    }
    const nextTotal = totalCents + lineTotalCents;
    if (!Number.isSafeInteger(nextTotal)) {
      totalIsSafe = false;
      continue;
    }
    totalCents = nextTotal;
  }

  const reportedTotal = totalIsSafe ? totalCents : undefined;
  return {
    items,
    totalCents: reportedTotal,
    listing: formatListing(items, reportedTotal),
  };
}

function formatListing(
  items: readonly ShownCartItem[],
  totalCents: number | undefined,
): string {
  if (items.length === 0) {
    return "The shopping cart is empty.";
  }

  const rows = items.map((item) => {
    const lineTotal =
      item.lineTotalCents === undefined
        ? "line total is outside the safe integer range"
        : `${item.lineTotalCents} cents`;
    return `${item.quantity} x ${item.name} (${item.productId}) @ ${item.unitPriceCents} cents = ${lineTotal}`;
  });
  const totalLine =
    totalCents === undefined
      ? "Total is outside the safe integer range."
      : `Total: ${totalCents} cents`;
  return ["Shopping cart", ...rows, totalLine].join("\n");
}
