import { AddItemToCart } from "./application/use-cases/add-item-to-cart";
import { RemoveItemFromCart } from "./application/use-cases/remove-item-from-cart";
import { ShowCartItems } from "./application/use-cases/show-cart-items";
import { DomainError } from "./domain/errors";
import { InMemoryCartRepository } from "./infrastructure/in-memory-cart-repository";
import { renderCart } from "./presentation/console-cart-view";

async function main(): Promise<void> {
  // Composition root: the only place that knows the concrete implementations.
  const carts = new InMemoryCartRepository();
  const addItem = new AddItemToCart(carts);
  const showItems = new ShowCartItems(carts);
  const removeItem = new RemoveItemFromCart(carts);

  const cartId = "cart-1";

  await addItem.execute({ cartId, productId: "p-1", name: "Keyboard", unitPriceInCents: 4999, quantity: 1 });
  await addItem.execute({ cartId, productId: "p-2", name: "USB cable", unitPriceInCents: 599, quantity: 2 });
  await addItem.execute({ cartId, productId: "p-2", name: "USB cable", unitPriceInCents: 599, quantity: 1 });

  console.log("After adding items:");
  console.log(renderCart(await showItems.execute(cartId)));

  await removeItem.execute(cartId, "p-1");
  console.log("\nAfter removing p-1:");
  console.log(renderCart(await showItems.execute(cartId)));

  try {
    await removeItem.execute(cartId, "p-1");
  } catch (error) {
    if (error instanceof DomainError) {
      console.log(`\nExpected error: ${error.message}`);
    } else {
      throw error;
    }
  }
}

void main();
