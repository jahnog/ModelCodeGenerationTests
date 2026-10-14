// Composition root. Wires the repository, use cases, presenter, and controller.

import { TextCartPresenter } from "./adapter-cart-presenter";
import {
  ShoppingCartController,
  type ShoppingCartProgram,
} from "./adapter-shopping-cart-controller";
import type { CartRepository } from "./application-port-cart-repository";
import { AddItemToCartInteractor } from "./application-use-case-add-item-to-cart";
import { RemoveItemFromCartInteractor } from "./application-use-case-remove-item-from-cart";
import { ShowCartItemsInteractor } from "./application-use-case-show-cart-items";
import { InMemoryCartRepository } from "./infrastructure-in-memory-cart-repository";

export type { AddItemView, CartLineView, CartView, RemoveItemView } from "./adapter-cart-presenter";
export type { ShoppingCartProgram } from "./adapter-shopping-cart-controller";
export type { AddItemToCartRequest } from "./application-use-case-add-item-to-cart";
export type { RemoveItemFromCartRequest } from "./application-use-case-remove-item-from-cart";

export function createShoppingCartProgram(
  repository?: CartRepository,
): ShoppingCartProgram {
  const cartRepository = repository ?? new InMemoryCartRepository();
  const presenter = new TextCartPresenter();
  return new ShoppingCartController(
    new AddItemToCartInteractor(cartRepository),
    new ShowCartItemsInteractor(cartRepository),
    new RemoveItemFromCartInteractor(cartRepository),
    presenter,
  );
}

export function runShoppingCartProgram(): string {
  const cart = createShoppingCartProgram();
  const parts: string[] = [];

  parts.push("Show:");
  parts.push(cart.showItems().text);

  const milk = cart.addItem({
    id: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 1,
  });
  parts.push("");
  parts.push(milk.message);
  if (milk.ok) {
    parts.push(milk.cart.text);
  }

  const moreMilk = cart.addItem({
    id: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 2,
  });
  parts.push("");
  parts.push(moreMilk.message);

  const bread = cart.addItem({
    id: "bread",
    name: "Bread",
    unitPriceCents: 250,
    quantity: 1,
  });
  parts.push("");
  parts.push(bread.message);

  parts.push("");
  parts.push("Show:");
  parts.push(cart.showItems().text);

  const removed = cart.removeItem({ id: "milk" });
  parts.push("");
  parts.push(removed.message);
  if (removed.ok) {
    parts.push(removed.cart.text);
  }

  parts.push("");
  parts.push("Show:");
  parts.push(cart.showItems().text);

  return parts.join("\n");
}
