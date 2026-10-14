// Composition root. It runs the slices and does not own cart rules.

import { addItemToCart } from "./add-item-to-cart/add-item-to-cart";
import { removeItemFromCart } from "./remove-item-from-cart/remove-item-from-cart";
import {
  emptyShoppingCart,
  type ShoppingCart,
} from "./shared/shopping-cart";
import { showCartItems } from "./show-cart-items/show-cart-items";

export function runShoppingCart(): string {
  let cart: ShoppingCart = emptyShoppingCart();

  cart = takeCart(
    addItemToCart(cart, {
      productId: "milk",
      name: "Milk",
      unitPriceCents: 199,
      quantity: 1,
    }),
  );
  cart = takeCart(
    addItemToCart(cart, {
      productId: "milk",
      name: "Milk",
      unitPriceCents: 199,
      quantity: 2,
    }),
  );
  cart = takeCart(
    addItemToCart(cart, {
      productId: "bread",
      name: "Bread",
      unitPriceCents: 250,
      quantity: 1,
    }),
  );

  const shown = showCartItems(cart);
  const removed = removeItemFromCart(cart, { productId: "milk" });
  if (!removed.ok) {
    throw new Error(removed.message);
  }

  const remaining = showCartItems(removed.cart);
  return [shown.listing, removed.message, remaining.listing].join("\n\n");
}

function takeCart(
  response:
    | { readonly ok: true; readonly cart: ShoppingCart }
    | { readonly ok: false; readonly message: string },
): ShoppingCart {
  if (!response.ok) {
    throw new Error(response.message);
  }
  return response.cart;
}

export const shoppingCartReport: string = runShoppingCart();
