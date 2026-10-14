import type { CartLine } from "./model/cart-item";
import { ShoppingCart } from "./model/shopping-cart";
import { CartView } from "./view/cart-view";
import { CartController } from "./controller/cart-controller";

export interface CartProgram {
  readonly model: ShoppingCart;
  readonly view: CartView;
  readonly controller: CartController;
}

export function createCartProgram(): CartProgram {
  const model = new ShoppingCart();
  const view = new CartView(model);
  const controller = new CartController(model, view);
  return { model, view, controller };
}

export interface ShoppingCartRun {
  readonly emptyListing: string;
  readonly afterAddListing: string;
  readonly afterRemoveListing: string;
  readonly itemsAfterAdd: readonly CartLine[];
  readonly itemsAfterRemove: readonly CartLine[];
}

export function runShoppingCart(): ShoppingCartRun {
  const { controller, view } = createCartProgram();
  const emptyListing = controller.showItems();

  controller.addItem({ id: "milk", name: "Milk", unitPriceCents: 189, quantity: 1 });
  controller.addItem({ id: "bread", name: "Bread", unitPriceCents: 249, quantity: 2 });
  const afterAddListing = controller.addItem({
    id: "milk",
    name: "Milk",
    unitPriceCents: 189,
    quantity: 1,
  });
  const itemsAfterAdd = view.items();

  const afterRemoveListing = controller.removeItem("bread");
  const itemsAfterRemove = view.items();

  return {
    emptyListing,
    afterAddListing,
    afterRemoveListing,
    itemsAfterAdd,
    itemsAfterRemove,
  };
}

export const demo = runShoppingCart();
