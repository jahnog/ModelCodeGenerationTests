import { ShoppingCartController } from "./shopping-cart.controller";
import { ShoppingCartModel } from "./shopping-cart.model";
import { ShoppingCartView } from "./shopping-cart.view";

export function main(): void {
  const cart = new ShoppingCartController(
    new ShoppingCartModel(),
    new ShoppingCartView(),
  );

  cart.addItem({ id: "book", name: "TypeScript Book", price: 25 }, 2);
  cart.addItem({ id: "pen", name: "Blue Pen", price: 1.5 });
  cart.showItems();

  cart.removeItem("book");
  cart.showItems();

  cart.removeItem("pen");
  cart.showItems();
}

main();
