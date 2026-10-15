import { addItem, emptyCart, removeItem, showCart } from "./cart";
import type { Cart, CartItem } from "./cart";

// Declared locally so the file needs neither DOM nor Node type definitions.
declare const console: { log(message: string): void };

const pipe =
  <T>(...steps: ReadonlyArray<(value: T) => T>) =>
  (initial: T): T =>
    steps.reduce((value, step) => step(value), initial);

const apple: CartItem = { id: "apple", name: "Apple", priceCents: 50, quantity: 3 };
const bread: CartItem = { id: "bread", name: "Bread", priceCents: 250, quantity: 1 };
const milk: CartItem = { id: "milk", name: "Milk", priceCents: 199, quantity: 2 };

export const main = (): void => {
  const filled: Cart = pipe<Cart>(
    (cart) => addItem(cart, apple),
    (cart) => addItem(cart, bread),
    (cart) => addItem(cart, milk),
    (cart) => addItem(cart, { ...apple, quantity: 2 }),
  )(emptyCart);

  console.log("After adding items:");
  console.log(showCart(filled));

  const trimmed = removeItem(filled, "bread");

  console.log("\nAfter removing Bread:");
  console.log(showCart(trimmed));
};

main();
