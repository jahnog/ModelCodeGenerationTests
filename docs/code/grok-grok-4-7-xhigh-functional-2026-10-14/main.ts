import { addItem, emptyCart, removeItem, type Cart, type CartError } from "./cart";
import type { Item } from "./item";
import { flatMapAll, map, match, type Result } from "./result";
import { describeCartError, showItems, type CartView } from "./show-items";

export type ProgramStep = {
  readonly label: string;
  readonly view: CartView;
};

type Trace = {
  readonly cart: Cart;
  readonly steps: readonly ProgramStep[];
};

type AddCommand = Item & { readonly kind: "add" };

type RemoveCommand = {
  readonly kind: "remove";
  readonly id: string;
};

type Command = AddCommand | RemoveCommand;

const begin = (): Trace => {
  const cart = emptyCart();
  return { cart, steps: [{ label: "Empty cart", view: showItems(cart) }] };
};

const snapshot = (trace: Trace, label: string, cart: Cart): Trace => ({
  cart,
  steps: [...trace.steps, { label, view: showItems(cart) }],
});

const applyCommand =
  (command: Command) =>
  (trace: Trace): Result<Trace, CartError> => {
    switch (command.kind) {
      case "add":
        return map(addItem(trace.cart, command), (cart) =>
          snapshot(trace, `Added ${command.quantity} x ${command.name}`, cart),
        );
      case "remove":
        return map(removeItem(trace.cart, command.id), (cart) =>
          snapshot(trace, `Removed ${command.id}`, cart),
        );
      default: {
        const unexpected: never = command;
        return unexpected;
      }
    }
  };

const commands: readonly Command[] = [
  { kind: "add", id: "pen", name: "Blue pen", unitPriceCents: 150, quantity: 2 },
  { kind: "add", id: "notebook", name: "Notebook", unitPriceCents: 499, quantity: 1 },
  { kind: "add", id: "pen", name: "Blue pen", unitPriceCents: 150, quantity: 1 },
  { kind: "remove", id: "pen" },
];

export const runShoppingCart = (): Result<readonly ProgramStep[], CartError> =>
  map(flatMapAll(begin(), commands.map(applyCommand)), (trace) => trace.steps);

export const renderProgram = (steps: readonly ProgramStep[]): string =>
  steps.map((step) => `${step.label}\n${step.view.text}`).join("\n\n");

export const main = (): string => {
  const text = match(runShoppingCart(), renderProgram, describeCartError);
  console.log(text);
  return text;
};

export const output = main();
