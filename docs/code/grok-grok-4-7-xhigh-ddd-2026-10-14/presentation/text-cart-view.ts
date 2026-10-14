import { type ShownCart, type ShownCartItem } from "../application/dto/shown-cart";

export function formatCart(cart: ShownCart): string {
  const header = `Shopping cart ${cart.cartId} (${countLabel(cart.lineCount, "line", "lines")}, ${countLabel(cart.unitCount, "unit", "units")})`;
  if (
    cart.items.length === 0 ||
    cart.totalMinor === undefined ||
    cart.currency === undefined
  ) {
    return `${header}\n(empty)`;
  }
  const lines = cart.items.map((item) => formatItem(item));
  const total = `Total: ${formatMoney(cart.totalMinor, cart.currency)}`;
  return [header, ...lines, total].join("\n");
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatItem(item: ShownCartItem): string {
  const each = formatMoney(item.unitPriceMinor, item.currency);
  const subtotal = formatMoney(item.lineTotalMinor, item.currency);
  return `${item.quantity} x ${item.productName} (${item.productId}) at ${each}, subtotal ${subtotal}`;
}

function formatMoney(amountMinor: number, currency: string): string {
  const negative = amountMinor < 0;
  const absolute = Math.abs(amountMinor);
  const major = Math.trunc(absolute / 100);
  const minor = absolute % 100;
  const minorText = minor < 10 ? `0${minor}` : `${minor}`;
  const sign = negative ? "-" : "";
  return `${sign}${major}.${minorText} ${currency}`;
}
