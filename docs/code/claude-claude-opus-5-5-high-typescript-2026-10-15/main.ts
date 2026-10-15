import { ShoppingCart } from "./cart";
import { formatCart, formatRemoveResult } from "./format";
import { toCents } from "./money";
import type { Product } from "./types";

const catalog = {
  apple: { id: "apple", name: "Apple", unitPrice: toCents(50) },
  bread: { id: "bread", name: "Bread", unitPrice: toCents(325) },
  milk: { id: "milk", name: "Milk", unitPrice: toCents(199) },
} as const satisfies Record<string, Product>;

export function main(log: (message: string) => void = console.log): void {
  const cart = new ShoppingCart();

  log("== Add items ==");
  cart.addItem(catalog.apple, 3);
  cart.addItem(catalog.bread);
  cart.addItem(catalog.milk, 2);
  cart.addItem(catalog.apple, 2);
  log(formatCart(cart));

  log("\n== Remove items ==");
  log(formatRemoveResult(cart.removeItem(catalog.apple.id, 4)));
  log(formatRemoveResult(cart.removeItem(catalog.bread.id)));
  log(formatRemoveResult(cart.removeItem("banana")));
  log(formatCart(cart));
}

main();
