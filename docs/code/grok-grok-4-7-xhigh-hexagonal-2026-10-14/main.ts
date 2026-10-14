import { InMemoryCartRepository } from "./adapter/driven/in-memory-cart-repository";
import { ShoppingCartDriver } from "./adapter/driving/shopping-cart-driver";
import { formatCartItems, formatRemovedItem } from "./adapter/driving/text-cart-view";
import type { CartLine, CartResult } from "./application/model/cart-line";
import type { CartRepository } from "./application/port/driven/cart-repository";
import type { RemoveItemResult } from "./application/port/driving/remove-item-from-cart";
import { AddItemToCartService } from "./application/use-case/add-item-to-cart";
import { RemoveItemFromCartService } from "./application/use-case/remove-item-from-cart";
import { ShowCartItemsService } from "./application/use-case/show-cart-items";

export function createShoppingCartDriver(
  repository: CartRepository = new InMemoryCartRepository(),
): ShoppingCartDriver {
  return new ShoppingCartDriver(
    new AddItemToCartService(repository),
    new ShowCartItemsService(repository),
    new RemoveItemFromCartService(repository),
  );
}

function acceptedItems(result: CartResult): readonly CartLine[] {
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.items;
}

function acceptedRemoval(result: RemoveItemResult): {
  readonly removed: CartLine;
  readonly items: readonly CartLine[];
} {
  if (!result.ok) {
    throw new Error(result.message);
  }
  return { removed: result.removed, items: result.items };
}

export function runShoppingCart(): string {
  const cart = createShoppingCartDriver();
  const before = cart.showItems();
  const milk = {
    id: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 1,
  };
  const afterFirstMilk = acceptedItems(cart.addItem(milk));
  const afterSecondMilk = acceptedItems(cart.addItem(milk));
  const afterBread = acceptedItems(
    cart.addItem({
      id: "bread",
      name: "Bread",
      unitPriceCents: 250,
      quantity: 1,
    }),
  );
  const shown = cart.showItems();
  const removed = acceptedRemoval(cart.removeItem({ id: "milk" }));
  const remaining = cart.showItems();

  return [
    "Shopping cart before adding items:",
    formatCartItems(before.items),
    "",
    "Added 1 x Milk (milk).",
    formatCartItems(afterFirstMilk),
    "",
    "Added 1 x Milk (milk).",
    formatCartItems(afterSecondMilk),
    "",
    "Added 1 x Bread (bread).",
    formatCartItems(afterBread),
    "",
    "Shopping cart:",
    formatCartItems(shown.items),
    "",
    formatRemovedItem(removed.removed),
    formatCartItems(removed.items),
    "",
    "Shopping cart after removal:",
    formatCartItems(remaining.items),
  ].join("\n");
}

export const shoppingCartReport = runShoppingCart();
