import { Cart, CartError, type Product } from "./cart";
import { formatCart } from "./format";

const apple: Product = { id: "apple", name: "Apple", priceInCents: 50 };
const bread: Product = { id: "bread", name: "Bread", priceInCents: 325 };
const milk: Product = { id: "milk", name: "Milk", priceInCents: 199 };

export function runDemo(): void {
  const cart = new Cart();

  console.log("Adding items...");
  cart.add(apple, 4);
  cart.add(bread);
  cart.add(milk, 2);
  cart.add(apple); // increases the existing line to 5
  console.log(formatCart(cart));

  console.log("\nRemoving 2 milk and all the bread...");
  cart.remove(milk.id, 2);
  cart.remove(bread.id);
  console.log(formatCart(cart));

  console.log("\nRemoving something that is not in the cart...");
  try {
    cart.remove(bread.id);
  } catch (error) {
    if (!(error instanceof CartError)) {
      throw error;
    }
    console.log(`Error: ${error.message}`);
  }

  console.log("\nRemoving the last item...");
  cart.remove(apple.id);
  console.log(formatCart(cart));
}

runDemo();
