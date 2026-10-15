import { createShoppingCart } from "./index";

export function runDemo(write: (message: string) => void = console.log): void {
  const cart = createShoppingCart();

  cart.addItem({
    id: "notebook",
    name: "Notebook",
    unitPriceInCents: 500,
    quantity: 2,
  });
  cart.addItem({
    id: "pen",
    name: "Pen",
    unitPriceInCents: 150,
  });
  write(cart.showItems());

  cart.removeItem("notebook");
  write(cart.showItems());

  cart.removeItem("pen");
  write(cart.showItems());
}

runDemo();
