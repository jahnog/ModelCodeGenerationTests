import type { CartItemView, CartView } from "../../application/dto/CartDto";

/** Turns use-case output into human-readable text. Knows nothing about where the text goes. */
export class CartPresenter {
  presentCart(view: CartView): string {
    if (view.items.length === 0) {
      return `Cart "${view.cartId}" is empty.`;
    }
    const lines = view.items.map((item) => this.formatLine(item));
    const unitLabel = view.totalQuantity === 1 ? "unit" : "units";
    return [
      `Cart "${view.cartId}" (${view.totalQuantity} ${unitLabel}):`,
      ...lines,
      `  Total: ${formatMoney(view.totalCents)}`,
    ].join("\n");
  }

  presentItemAdded(view: CartView, itemId: string): string {
    const item = view.items.find((candidate) => candidate.id === itemId);
    const description = item === undefined ? `"${itemId}"` : `${item.name} (now ${item.quantity} in cart)`;
    return `Added ${description}.`;
  }

  presentItemRemoved(view: CartView, itemId: string): string {
    const remaining = view.items.length;
    return `Removed "${itemId}". ${remaining} item${remaining === 1 ? "" : "s"} left in the cart.`;
  }

  presentError(message: string): string {
    return `Error: ${message}`;
  }

  presentHelp(): string {
    return [
      "Commands:",
      '  add <id> "<name>" <price> [quantity]   add an item, e.g. add apple "Green apple" 0.50 3',
      "  show                                   show the items in the cart",
      "  remove <id>                            remove an item from the cart",
    ].join("\n");
  }

  private formatLine(item: CartItemView): string {
    return `  - [${item.id}] ${item.name}: ${item.quantity} x ${formatMoney(item.unitPriceCents)} = ${formatMoney(item.subtotalCents)}`;
  }
}

export function formatMoney(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `$${whole}.${fraction}`;
}
