import type { CartItem } from "./cart-item";
import { InMemoryCartRepository } from "./in-memory-cart-repository";
import { ShoppingCartService } from "./shopping-cart-service";

function showItems(items: readonly CartItem[]): void {
  console.log("Shopping cart:");

  if (items.length === 0) {
    console.log("  (empty)");
    return;
  }

  for (const item of items) {
    console.log(`  ${item.id}: ${item.name} - $${item.price.toFixed(2)}`);
  }
}

export function main(): void {
  const repository = new InMemoryCartRepository();
  const cart = new ShoppingCartService(repository);

  cart.addItem({ id: "book", name: "TypeScript Book", price: 29.99 });
  cart.addItem({ id: "pen", name: "Pen", price: 2.5 });
  showItems(cart.getItems());

  cart.removeItem("book");
  showItems(cart.getItems());

  cart.removeItem("pen");
  showItems(cart.getItems());
}

main();
