import { CartController } from "./controller/CartController";
import { CartModel } from "./model/CartModel";
import { CartView } from "./view/CartView";

export function main(): void {
  const controller = new CartController(new CartModel(), new CartView());

  controller.addItem("Apple", 0.5, 4);
  controller.addItem("Bread", 2.25);
  controller.addItem("Milk", 1.99, 2);
  controller.showItems();

  controller.removeItem(2);
  controller.showItems();

  controller.removeItem(99);
}

main();
