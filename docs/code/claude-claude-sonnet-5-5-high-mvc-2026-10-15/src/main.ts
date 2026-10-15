import { Cart } from "./models/Cart";
import { CartView } from "./views/CartView";
import { CartController } from "./controllers/CartController";

const controller = new CartController(new Cart(), new CartView());

controller.showItems();
controller.addItem("apple", "Apple", 50, 3);
controller.addItem("bread", "Bread", 250);
controller.addItem("apple", "Apple", 50, 2);
controller.addItem("milk", "Milk", 199, 0);
controller.showItems();
controller.removeItem("bread");
controller.removeItem("bread");
controller.showItems();

export {};
