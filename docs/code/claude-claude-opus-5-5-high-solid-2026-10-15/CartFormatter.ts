import type { CartItem } from "./CartItem";

/** Turns cart items into text (Open/Closed: add a new formatter instead of editing the view). */
export interface CartFormatter {
  format(items: readonly CartItem[]): string;
}

export class TextCartFormatter implements CartFormatter {
  private readonly money: Intl.NumberFormat;

  constructor(locale = "en-US", currency = "USD") {
    this.money = new Intl.NumberFormat(locale, { style: "currency", currency });
  }

  format(items: readonly CartItem[]): string {
    if (items.length === 0) {
      return "The shopping cart is empty.";
    }
    const lines = items.map(
      (item, index) =>
        `${index + 1}. [${item.id}] ${item.name} x${item.quantity} @ ${this.price(item.unitPriceCents)}` +
        ` = ${this.price(item.unitPriceCents * item.quantity)}`,
    );
    const totalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    return ["Shopping cart:", ...lines, `Total: ${this.price(totalCents)}`].join("\n");
  }

  private price(cents: number): string {
    return this.money.format(cents / 100);
  }
}
