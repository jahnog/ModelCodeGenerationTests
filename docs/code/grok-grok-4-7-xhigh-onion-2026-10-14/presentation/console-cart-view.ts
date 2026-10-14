import type {
  CartFailure,
  CartItemData,
  CartView,
  RemovedItemView,
} from "../application/dto/cart-view";

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  return `${sign}$${dollars}.${remainder.toString().padStart(2, "0")}`;
}

export class ConsoleCartView {
  showItems(view: CartView): string {
    if (view.items.length === 0) {
      return "The shopping cart is empty.";
    }
    const lines = view.items.map((item) => this.#formatItem(item));
    return [
      ...lines,
      `Items: ${view.itemCount}`,
      `Total: ${formatCents(view.totalCents)}`,
    ].join("\n");
  }

  showRemoved(result: RemovedItemView): string {
    const item = result.removed;
    return `Removed ${item.quantity} x ${item.name} (${item.productId}).`;
  }

  showFailure(failure: CartFailure): string {
    return `Cannot update the cart: ${failure.message}`;
  }

  #formatItem(item: CartItemData): string {
    const price = formatCents(item.unitPriceCents);
    const lineTotal = formatCents(item.lineTotalCents);
    return `${item.quantity} x ${item.name} (${item.productId}) @ ${price} = ${lineTotal}`;
  }
}
