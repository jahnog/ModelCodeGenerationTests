import { addItem } from "./features/add-item";
import { removeItem } from "./features/remove-item";
import { renderCart, showCart } from "./features/show-cart";
import { createInMemoryCartStore } from "./shared/cart-store";

export const runDemo = (): string => {
  const store = createInMemoryCartStore();
  const output: string[] = [];

  addItem(store, { productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 3 });
  addItem(store, { productId: "bread", name: "Bread", unitPriceCents: 249, quantity: 1 });
  addItem(store, { productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 2 });
  output.push("After adding items:", renderCart(showCart(store)));

  removeItem(store, { productId: "apple", quantity: 4 });
  output.push("", "After removing 4 apples:", renderCart(showCart(store)));

  removeItem(store, { productId: "bread" });
  output.push("", "After removing bread:", renderCart(showCart(store)));

  const missing = removeItem(store, { productId: "milk" });
  if (!missing.ok) output.push("", `Error: ${missing.error.kind}`);

  return output.join("\n");
};

console.log(runDemo());
