import { describeCart, ShoppingCart, type Product } from "./cart";

const apple: Product = { id: "apple", name: "Apple", priceCents: 50 };
const bread: Product = { id: "bread", name: "Bread", priceCents: 249 };
const milk: Product = { id: "milk", name: "Milk", priceCents: 199 };

function show(cart: ShoppingCart): void {
  for (const line of describeCart(cart)) {
    console.log(line);
  }
  console.log("");
}

export function main(): void {
  const cart = new ShoppingCart();
  show(cart);

  console.log("Adding 3 apples, 1 bread and 2 milk.");
  cart.addItem(apple, 3);
  cart.addItem(bread);
  cart.addItem(milk, 2);
  show(cart);

  console.log("Removing 1 apple.");
  cart.removeItem(apple.id, 1);
  show(cart);

  console.log("Removing the bread.");
  cart.removeItem(bread.id);
  show(cart);
}

main();
