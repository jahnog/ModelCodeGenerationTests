import { AddItemToCart } from "./application/use-case/add-item-to-cart";
import { RemoveItemFromCart } from "./application/use-case/remove-item-from-cart";
import { ShowCartItems } from "./application/use-case/show-cart-items";
import { ApplicationError } from "./application/error/cart-not-found";
import { DomainError } from "./domain/error/domain-error";
import { RecordingDomainEventPublisher } from "./infrastructure/event/recording-domain-event-publisher";
import { InMemoryShoppingCartRepository } from "./infrastructure/persistence/in-memory-shopping-cart-repository";
import { formatCart } from "./presentation/text-cart-view";

export function main(): void {
  const carts = new InMemoryShoppingCartRepository();
  const events = new RecordingDomainEventPublisher();
  const addItemToCart = new AddItemToCart(carts, events);
  const removeItemFromCart = new RemoveItemFromCart(carts, events);
  const showCartItems = new ShowCartItems(carts);
  const cartId = "cart-1";

  addItemToCart.execute({
    cartId,
    productId: "sku-tea",
    productName: "Green tea",
    unitPriceMinor: 350,
    currency: "EUR",
    quantity: 2,
  });
  addItemToCart.execute({
    cartId,
    productId: "sku-bread",
    productName: "Rye bread",
    unitPriceMinor: 220,
    currency: "EUR",
    quantity: 1,
  });
  addItemToCart.execute({
    cartId,
    productId: "sku-tea",
    productName: "Green tea",
    unitPriceMinor: 350,
    currency: "EUR",
    quantity: 1,
  });

  console.log(formatCart(showCartItems.execute({ cartId })));
  console.log("");

  removeItemFromCart.execute({ cartId, productId: "sku-bread" });
  console.log(formatCart(showCartItems.execute({ cartId })));

  try {
    removeItemFromCart.execute({ cartId, productId: "sku-bread" });
  } catch (error: unknown) {
    if (error instanceof DomainError || error instanceof ApplicationError) {
      console.log(error.message);
      return;
    }
    throw error;
  }
}

main();
