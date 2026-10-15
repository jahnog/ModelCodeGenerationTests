import type { Cart, NewItem } from "../../../domain/cart";

/** Driving port: what the outside world can ask the application to do. */
export interface CartUseCases {
  addItem(cartId: string, item: NewItem): Promise<Cart>;
  showItems(cartId: string): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
}
