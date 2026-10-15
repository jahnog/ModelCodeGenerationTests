import { InMemoryShoppingCartRepository } from "./in-memory-shopping-cart-repository";
import { ShoppingCartService } from "./shopping-cart-service";

export function runDemo(): void {
  const repository = new InMemoryShoppingCartRepository();
  const service = new ShoppingCartService(repository);
  const cartId = "my-cart";

  const showItems = (): void => {
    const items = service.listItems(cartId);
    if (items.length === 0) {
      console.log("The shopping cart is empty.");
      return;
    }
    for (const item of items) {
      console.log(`${item.productId}: ${item.name} x ${item.quantity}`);
    }
  };

  service.createCart(cartId);
  service.addItem(cartId, { productId: "book", name: "TypeScript Book" });
  service.addItem(cartId, { productId: "book", name: "TypeScript Book" });
  service.addItem(cartId, { productId: "keyboard", name: "Keyboard" });

  console.log("Shopping cart:");
  showItems();

  service.removeItem(cartId, "book");
  console.log("\nAfter removing the book:");
  showItems();
}

runDemo();
