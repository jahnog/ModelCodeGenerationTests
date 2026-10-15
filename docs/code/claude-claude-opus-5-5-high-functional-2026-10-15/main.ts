// Entry point. The session is a list of commands folded over the cart; only `main` performs output.

import { addItem, emptyCart, formatCart, formatError, removeItem } from "./cart";
import type { Cart, Item } from "./types";

export type Command =
  | { readonly kind: "add"; readonly item: Item }
  | { readonly kind: "remove"; readonly id: string }
  | { readonly kind: "show" };

export type Session = {
  readonly cart: Cart;
  readonly output: readonly string[];
};

const step = (session: Session, command: Command): Session => {
  const { cart, output } = session;
  switch (command.kind) {
    case "show":
      return { cart, output: [...output, "Cart:", formatCart(cart)] };
    case "add": {
      const result = addItem(cart, command.item);
      return result.ok
        ? { cart: result.value, output: [...output, `Added ${command.item.quantity} x ${command.item.name}`] }
        : { cart, output: [...output, formatError(result.error)] };
    }
    case "remove": {
      const result = removeItem(cart, command.id);
      return result.ok
        ? { cart: result.value, output: [...output, `Removed item "${command.id}"`] }
        : { cart, output: [...output, formatError(result.error)] };
    }
  }
};

export const runSession = (commands: readonly Command[], start: Cart = emptyCart): Session =>
  commands.reduce(step, { cart: start, output: [] });

const demo: readonly Command[] = [
  { kind: "show" },
  { kind: "add", item: { id: "apple", name: "Apple", priceCents: 50, quantity: 3 } },
  { kind: "add", item: { id: "bread", name: "Bread", priceCents: 249, quantity: 1 } },
  { kind: "add", item: { id: "milk", name: "Milk", priceCents: 199, quantity: 2 } },
  { kind: "add", item: { id: "apple", name: "Apple", priceCents: 50, quantity: 2 } },
  { kind: "show" },
  { kind: "remove", id: "bread" },
  { kind: "remove", id: "bread" },
  { kind: "show" },
];

export const main = (): void => {
  runSession(demo).output.forEach((line) => console.log(line));
};

main();
