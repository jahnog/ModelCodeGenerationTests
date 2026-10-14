import { addItem, removeItem, showItems, type Cart, type Item } from "../domain/cart";

export type CartStore = {
  add(cart: Cart, item: Item): Cart;
  show(cart: Cart): readonly Item[];
  remove(cart: Cart, id: string): Cart;
};

export function createStore(): CartStore {
  return { add: addItem, show: showItems, remove: removeItem };
}
