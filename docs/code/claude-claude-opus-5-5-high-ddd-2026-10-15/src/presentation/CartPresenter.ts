import type { CartView } from "../application/CartView";

/** Turns a CartView into lines of text for the user. */
export class CartPresenter {
  present(cart: CartView): string[] {
    const header = `Cart ${cart.cartId}`;
    if (cart.items.length === 0) {
      return [header, "  (empty)"];
    }

    const lines = [header];
    for (const item of cart.items) {
      lines.push(
        `  - ${item.name} [${item.productId}] ` +
          `${item.quantity} x ${formatMoney(item.unitPriceCents, cart.currency)} ` +
          `= ${formatMoney(item.subtotalCents, cart.currency)}`,
      );
    }
    const unitWord = cart.totalQuantity === 1 ? "unit" : "units";
    lines.push(
      `  Total: ${formatMoney(cart.totalCents, cart.currency)} (${cart.totalQuantity} ${unitWord})`,
    );
    return lines;
  }
}

export function formatMoney(cents: number, currency: string): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction} ${currency}`;
}
