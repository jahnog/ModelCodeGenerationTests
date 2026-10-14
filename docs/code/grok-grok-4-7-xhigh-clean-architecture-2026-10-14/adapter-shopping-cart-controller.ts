// Interface adapter. Driving API: add an item, show the items, and remove an item.

import type { AddItemToCartInput, AddItemToCartRequest } from "./application-use-case-add-item-to-cart";
import type { RemoveItemFromCartInput, RemoveItemFromCartRequest } from "./application-use-case-remove-item-from-cart";
import type { ShowCartItemsInput } from "./application-use-case-show-cart-items";
import type { AddItemView, CartPresenter, CartView, RemoveItemView } from "./adapter-cart-presenter";

export interface ShoppingCartProgram {
  addItem(request: AddItemToCartRequest): AddItemView;
  showItems(): CartView;
  removeItem(request: RemoveItemFromCartRequest): RemoveItemView;
}

export class ShoppingCartController implements ShoppingCartProgram {
  private readonly addItemToCart: AddItemToCartInput;
  private readonly showCartItems: ShowCartItemsInput;
  private readonly removeItemFromCart: RemoveItemFromCartInput;
  private readonly presenter: CartPresenter;

  constructor(
    addItemToCart: AddItemToCartInput,
    showCartItems: ShowCartItemsInput,
    removeItemFromCart: RemoveItemFromCartInput,
    presenter: CartPresenter,
  ) {
    this.addItemToCart = addItemToCart;
    this.showCartItems = showCartItems;
    this.removeItemFromCart = removeItemFromCart;
    this.presenter = presenter;
  }

  addItem(request: AddItemToCartRequest): AddItemView {
    return this.presenter.presentAdded(this.addItemToCart.execute(request));
  }

  showItems(): CartView {
    return this.presenter.presentCart(this.showCartItems.execute());
  }

  removeItem(request: RemoveItemFromCartRequest): RemoveItemView {
    return this.presenter.presentRemoved(this.removeItemFromCart.execute(request));
  }
}
