import type {
  AddItemCommand,
  AddItemToCart,
} from "../../application/port/driving/add-item-to-cart";
import type {
  RemoveItemCommand,
  RemoveItemFromCart,
  RemoveItemResult,
} from "../../application/port/driving/remove-item-from-cart";
import type {
  CartSnapshot,
  ShowCartItems,
} from "../../application/port/driving/show-cart-items";
import type { CartResult } from "../../application/model/cart-line";

export class ShoppingCartDriver {
  readonly #addItemToCart: AddItemToCart;
  readonly #showCartItems: ShowCartItems;
  readonly #removeItemFromCart: RemoveItemFromCart;

  constructor(
    addItemToCart: AddItemToCart,
    showCartItems: ShowCartItems,
    removeItemFromCart: RemoveItemFromCart,
  ) {
    this.#addItemToCart = addItemToCart;
    this.#showCartItems = showCartItems;
    this.#removeItemFromCart = removeItemFromCart;
  }

  addItem(command: AddItemCommand): CartResult {
    return this.#addItemToCart.add(command);
  }

  showItems(): CartSnapshot {
    return this.#showCartItems.show();
  }

  removeItem(command: RemoveItemCommand): RemoveItemResult {
    return this.#removeItemFromCart.remove(command);
  }
}
