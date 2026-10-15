import { CartService } from "./application/CartService";
import { DomainError } from "./domain/shared/DomainError";
import { InMemoryCartRepository } from "./infrastructure/InMemoryCartRepository";
import { renderCart } from "./infrastructure/renderCart";

declare const console: { log(message: string): void };

export function runDemo(): void {
  const cart = new CartService(new InMemoryCartRepository());
  const cartId = "cart-1";

  cart.addItem({ cartId, productId: "book-1", name: "TypeScript Book", unitPriceCents: 2999, quantity: 1 });
  cart.addItem({ cartId, productId: "pen-1", name: "Pen", unitPriceCents: 150, quantity: 3 });
  cart.addItem({ cartId, productId: "book-1", name: "TypeScript Book", unitPriceCents: 2999, quantity: 1 });
  console.log(renderCart(cart.showCart(cartId)));

  cart.removeItem({ cartId, productId: "pen-1" });
  console.log(renderCart(cart.showCart(cartId)));

  try {
    cart.removeItem({ cartId, productId: "pen-1" });
  } catch (error) {
    if (error instanceof DomainError) {
      console.log(`Error: ${error.message}`);
    } else {
      throw error;
    }
  }
}

runDemo();
