import { AddItemToCart } from "./add-item";
import type { CartItem } from "./cart-item";
import type { AddItemStore, RemoveItemStore, ShowItemsStore } from "./cart-store";
import { InMemoryCartStore } from "./in-memory-cart-store";
import { SumQuantityMergePolicy, type LineMergePolicy } from "./line-merge-policy";
import { RemoveItemFromCart } from "./remove-item";
import { ShowCartItems } from "./show-items";
import type { CartListing, ShownCart } from "./shown-cart";
import { TextCartListing } from "./text-cart-listing";

export interface ShoppingCart {
  addItem(item: CartItem): CartItem;
  showItems(): ShownCart;
  removeItem(id: string): CartItem;
}

type CartStore = AddItemStore & RemoveItemStore & ShowItemsStore;

export function createShoppingCart(
  store: CartStore = new InMemoryCartStore(),
  merge: LineMergePolicy = new SumQuantityMergePolicy(),
  listing: CartListing = new TextCartListing(),
): ShoppingCart {
  const addItem = new AddItemToCart(store, merge);
  const showItems = new ShowCartItems(store, listing);
  const removeItem = new RemoveItemFromCart(store);
  return {
    addItem(item: CartItem): CartItem {
      return addItem.execute(item);
    },
    showItems(): ShownCart {
      return showItems.execute();
    },
    removeItem(id: string): CartItem {
      return removeItem.execute(id);
    },
  };
}

export interface ShoppingCartRun {
  readonly emptyListing: string;
  readonly afterAdd: ShownCart;
  readonly removed: CartItem;
  readonly afterRemove: ShownCart;
}

export function runShoppingCart(): ShoppingCartRun {
  const cart = createShoppingCart();
  const emptyListing = cart.showItems().listing;
  cart.addItem({ id: "milk", name: "Milk", unitPriceCents: 189, quantity: 1 });
  cart.addItem({ id: "bread", name: "Bread", unitPriceCents: 249, quantity: 2 });
  cart.addItem({ id: "milk", name: "Milk", unitPriceCents: 189, quantity: 1 });
  const afterAdd = cart.showItems();
  const removed = cart.removeItem("bread");
  const afterRemove = cart.showItems();
  return { emptyListing, afterAdd, removed, afterRemove };
}

export const shoppingCartRun = runShoppingCart();
