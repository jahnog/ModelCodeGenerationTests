// Composition root: wires the store into each slice and runs a short demo.

import { InMemoryCartStore } from "./shared/cart";
import type { Result } from "./shared/result";
import { addItem } from "./features/add-item/add-item";
import { formatCart, viewCart } from "./features/view-cart/view-cart";
import { removeItem } from "./features/remove-item/remove-item";

function report<T>(action: string, result: Result<T>): void {
  console.log(result.ok ? `${action}: done` : `${action}: failed - ${result.error}`);
}

export function main(): void {
  const store = new InMemoryCartStore();
  const show = (): void => console.log(formatCart(viewCart(store)) + "\n");

  show();

  report("Add 2 apples", addItem(store, { productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 2 }));
  report("Add 1 bread", addItem(store, { productId: "bread", name: "Bread", unitPriceCents: 325 }));
  report("Add 3 more apples", addItem(store, { productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 3 }));
  show();

  report("Remove 1 apple", removeItem(store, { productId: "apple", quantity: 1 }));
  report("Remove all bread", removeItem(store, { productId: "bread" }));
  report("Remove milk", removeItem(store, { productId: "milk" }));
  show();
}

main();
