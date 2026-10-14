import { formatItems } from "./format-items";
import type { Item } from "./item";
import { ShoppingCart } from "./shopping-cart";

export function runShoppingCartProgram(): string {
  const cart = new ShoppingCart();
  const apple: Item = {
    id: "apple",
    name: "Apple",
    unitPriceInCents: 125,
    quantity: 4,
  };
  const bread: Item = {
    id: "bread",
    name: "Bread",
    unitPriceInCents: 250,
    quantity: 1,
  };

  cart.addItem(apple);
  cart.addItem(bread);
  const beforeRemoval = formatItems(cart.showItems());

  cart.removeItem(apple.id);
  const afterRemoval = formatItems(cart.showItems());

  return [
    "Shopping cart:",
    beforeRemoval,
    "",
    "Shopping cart after removing Apple:",
    afterRemoval,
  ].join("\n");
}
