import { CartView } from "../application/CartService";

export function renderCart(view: CartView): string {
  const header = `Cart ${view.cartId}`;
  if (view.items.length === 0) {
    return `${header}\n  (empty)`;
  }
  const lines = view.items.map(
    (i) => `  ${i.quantity} x ${i.name} [${i.productId}] @ ${i.unitPrice} = ${i.total}`,
  );
  return [header, ...lines, `  Total: ${view.total}`].join("\n");
}
