import { CartPresenter } from "./cart-presenter";
import { InMemoryCartStore } from "./cart-store";
import { ShoppingCart } from "./shopping-cart";

export function main(): void {
  const cart = new ShoppingCart(new InMemoryCartStore());
  const presenter = new CartPresenter(cart, (message) => console.log(message));

  cart.addItem({
    id: "book",
    name: "TypeScript Handbook",
    unitPriceCents: 2500,
    quantity: 1,
  });
  cart.addItem({
    id: "pen",
    name: "Pen",
    unitPriceCents: 150,
    quantity: 2,
  });
  presenter.showItems();

  cart.removeItem("book");
  presenter.showItems();

  cart.removeItem("pen");
  presenter.showItems();
}

main();
