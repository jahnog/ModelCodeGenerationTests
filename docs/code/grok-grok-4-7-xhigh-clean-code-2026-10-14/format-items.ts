import { CartError } from "./cart-error";
import { lineTotalInCents, type Item } from "./item";

const CENTS_PER_DOLLAR = 100;

export function formatItems(items: readonly Item[]): string {
  const lines = [...itemLines(items), totalLine(items)];
  return lines.join("\n");
}

function itemLines(items: readonly Item[]): readonly string[] {
  if (items.length === 0) {
    return ["The cart is empty."];
  }
  return items.map(formatItem);
}

function formatItem(item: Item): string {
  const unitPrice = formatMoney(item.unitPriceInCents);
  const lineTotal = formatMoney(lineTotalInCents(item));
  return `${item.name} x ${item.quantity} @ ${unitPrice} = ${lineTotal}`;
}

function totalLine(items: readonly Item[]): string {
  return `Total: ${formatMoney(totalInCents(items))}`;
}

function totalInCents(items: readonly Item[]): number {
  return items.reduce(
    (sum, item) => addCents(sum, lineTotalInCents(item)),
    0,
  );
}

function addCents(left: number, right: number): number {
  const sum = left + right;
  if (!Number.isSafeInteger(sum)) {
    throw new CartError("Cart total is too large.");
  }
  return sum;
}

function formatMoney(cents: number): string {
  const dollars = Math.floor(cents / CENTS_PER_DOLLAR);
  const remainder = cents % CENTS_PER_DOLLAR;
  return `$${dollars}.${remainder.toString().padStart(2, "0")}`;
}
