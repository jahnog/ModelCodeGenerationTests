import type { CartDto, CartItemDto } from "../application";

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  return `${sign}$${whole}.${fraction}`;
}

export function formatAdded(item: CartItemDto): string {
  return `Added ${item.name} (${item.id}). Quantity in cart: ${item.quantity}.`;
}

export function formatRemoved(item: CartItemDto): string {
  return `Removed ${item.name} (${item.id}) from the cart.`;
}

export function formatCart(cart: CartDto): string {
  if (cart.items.length === 0) return "The shopping cart is empty.";

  const rows = cart.items.map((item) => [
    item.id,
    item.name,
    String(item.quantity),
    formatMoney(item.unitPriceCents),
    formatMoney(item.subtotalCents),
  ]);
  const header = ["ID", "Name", "Qty", "Unit price", "Subtotal"];
  const widths = header.map((title, column) =>
    Math.max(title.length, ...rows.map((row) => (row[column] ?? "").length)),
  );
  const line = (cells: readonly string[]): string =>
    cells.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join("  ").trimEnd();
  const rule = widths.map((width) => "-".repeat(width)).join("  ");

  return [
    "Shopping cart:",
    line(header),
    rule,
    ...rows.map(line),
    rule,
    `Total: ${formatMoney(cart.totalCents)}`,
  ].join("\n");
}

export const HELP_TEXT = [
  "Commands:",
  "  add <id> <unit price> <quantity> <name>   e.g. add A1 2.50 3 Green apple",
  "  list                                      show the items in the cart",
  "  remove <id>                               remove an item from the cart",
  "  help                                      show this help",
].join("\n");
