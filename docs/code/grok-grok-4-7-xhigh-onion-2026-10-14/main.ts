import { AddItemToCart } from "./application/service/add-item-to-cart";
import { RemoveItemFromCart } from "./application/service/remove-item-from-cart";
import { ShowCartItems } from "./application/service/show-cart-items";
import type { CartResult, RemoveItemResult } from "./application/dto/cart-view";
import { InMemoryShoppingCartRepository } from "./infrastructure/persistence/in-memory-shopping-cart-repository";
import { ConsoleCartView } from "./presentation/console-cart-view";

export interface CartApplication {
  readonly addItem: AddItemToCart;
  readonly showItems: ShowCartItems;
  readonly removeItem: RemoveItemFromCart;
}

export function createCartApplication(): CartApplication {
  const carts = new InMemoryShoppingCartRepository();
  return {
    addItem: new AddItemToCart(carts),
    showItems: new ShowCartItems(carts),
    removeItem: new RemoveItemFromCart(carts),
  };
}

function renderCart(view: ConsoleCartView, result: CartResult): string {
  return result.ok ? view.showItems(result) : view.showFailure(result);
}

function renderRemoval(view: ConsoleCartView, result: RemoveItemResult): string {
  if (!result.ok) {
    return view.showFailure(result);
  }
  return [view.showRemoved(result), view.showItems(result)].join("\n");
}

export function runShoppingCart(): string {
  const cart = createCartApplication();
  const view = new ConsoleCartView();
  const milk = {
    productId: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 1,
  };
  const before = cart.showItems.show();
  const afterFirstMilk = cart.addItem.add(milk);
  const afterSecondMilk = cart.addItem.add(milk);
  const afterBread = cart.addItem.add({
    productId: "bread",
    name: "Bread",
    unitPriceCents: 250,
    quantity: 1,
  });
  const shown = cart.showItems.show();
  const removed = cart.removeItem.remove({ productId: "milk" });
  const remaining = cart.showItems.show();

  return [
    "Shopping cart before adding items:",
    renderCart(view, before),
    "",
    "Added 1 x Milk.",
    renderCart(view, afterFirstMilk),
    "",
    "Added 1 x Milk again.",
    renderCart(view, afterSecondMilk),
    "",
    "Added 1 x Bread.",
    renderCart(view, afterBread),
    "",
    "Shopping cart:",
    renderCart(view, shown),
    "",
    "Removed milk:",
    renderRemoval(view, removed),
    "",
    "Shopping cart after removal:",
    renderCart(view, remaining),
  ].join("\n");
}

export const shoppingCartReport = runShoppingCart();

console.log(shoppingCartReport);
