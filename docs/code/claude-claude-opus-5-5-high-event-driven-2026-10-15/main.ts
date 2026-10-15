import { ShoppingCart } from "./cart";
import { attachCartView, type Output } from "./cartView";
import { EventBus } from "./eventBus";
import type { CartEventMap } from "./events";

// The program imports no Node built-ins, so it looks the console up at run
// time instead of relying on DOM or Node type declarations.
function consoleOutput(): Output {
  const host = globalThis as {
    console?: { log(message: string): void };
  };
  return {
    writeLine(line: string): void {
      host.console?.log(line);
    },
  };
}

export function run(output: Output = consoleOutput()): void {
  const bus = new EventBus<CartEventMap>();
  const cart = new ShoppingCart(bus);
  const detachView = attachCartView(bus, output);

  // The program only publishes requests. The cart decides what happens and
  // the view reports it.
  bus.emit("ShowCartRequested", {});

  bus.emit("AddItemRequested", {
    id: "apple",
    name: "Apple",
    priceCents: 50,
    quantity: 3,
  });
  bus.emit("AddItemRequested", {
    id: "bread",
    name: "Bread",
    priceCents: 249,
    quantity: 1,
  });
  bus.emit("AddItemRequested", {
    id: "apple",
    name: "Apple",
    priceCents: 50,
    quantity: 2,
  });
  bus.emit("AddItemRequested", {
    id: "milk",
    name: "Milk",
    priceCents: 199,
    quantity: 0,
  });
  bus.emit("ShowCartRequested", {});

  bus.emit("RemoveItemRequested", { id: "bread" });
  bus.emit("RemoveItemRequested", { id: "bread" });
  bus.emit("ShowCartRequested", {});

  detachView();
  cart.dispose();
}

run();
