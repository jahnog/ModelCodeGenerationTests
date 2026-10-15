import { ShoppingCart } from "./cart";
import { formatCart } from "./format";

export const runDemo = (): readonly string[] => {
  const cart = new ShoppingCart();
  const output: string[] = [];

  cart.addItem({ id: "apple", name: "Apple", priceCents: 50, quantity: 2 });
  cart.addItem({ id: "bread", name: "Bread", priceCents: 250 });
  output.push("Added Apple, Bread", formatCart(cart.getItems()));

  cart.removeItem("apple");
  output.push("Removed Apple", formatCart(cart.getItems()));

  return output;
};
