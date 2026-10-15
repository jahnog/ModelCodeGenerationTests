import { renderCart } from "./cart-view";
import { ShoppingCart } from "./shopping-cart";

export function runDemo(): void {
  const cart = new ShoppingCart();

  cart.addItem({ id: "apple", name: "Apple", unitPriceInCents: 50, quantity: 3 });
  cart.addItem({ id: "bread", name: "Bread", unitPriceInCents: 275, quantity: 1 });
  cart.addItem({ id: "apple", name: "Apple", unitPriceInCents: 50, quantity: 2 });
  console.log("After adding items:");
  console.log(renderCart(cart));

  cart.removeItem("apple");
  console.log("\nAfter removing the apples:");
  console.log(renderCart(cart));
}

runDemo();
