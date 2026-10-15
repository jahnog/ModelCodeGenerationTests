import { addItem, emptyCart, removeItem, showCart } from "./cart";

export function runDemo(): void {
  let cart = emptyCart;

  console.log("Adding items:");
  cart = addItem(cart, { id: "apple", name: "Apple", unitPriceCents: 50, quantity: 4 });
  cart = addItem(cart, { id: "bread", name: "Bread", unitPriceCents: 325 });
  cart = addItem(cart, { id: "milk", name: "Milk", unitPriceCents: 199, quantity: 2 });
  cart = addItem(cart, { id: "apple", name: "Apple", unitPriceCents: 50 });
  showCart(cart);

  console.log("\nRemoving 2 apples:");
  cart = removeItem(cart, "apple", 2);
  showCart(cart);

  console.log("\nRemoving the bread:");
  cart = removeItem(cart, "bread");
  showCart(cart);

  console.log("\nRemoving everything else:");
  cart = removeItem(cart, "apple");
  cart = removeItem(cart, "milk");
  showCart(cart);
}

runDemo();
