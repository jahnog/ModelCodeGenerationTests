import type {
  AddItemToCart,
  ListCartItems,
  RemoveItemFromCart,
} from "./cart-use-cases";
import type { AddItemInput } from "./shopping-cart";

export class CartController {
  private readonly addItemToCart: AddItemToCart;
  private readonly listCartItems: ListCartItems;
  private readonly removeItemFromCart: RemoveItemFromCart;

  constructor(
    addItemToCart: AddItemToCart,
    listCartItems: ListCartItems,
    removeItemFromCart: RemoveItemFromCart,
  ) {
    this.addItemToCart = addItemToCart;
    this.listCartItems = listCartItems;
    this.removeItemFromCart = removeItemFromCart;
  }

  addItem(input: AddItemInput): void {
    this.addItemToCart.execute(input);
  }

  showItems(): string {
    const items = this.listCartItems.execute();
    if (items.length === 0) {
      return "Shopping cart is empty.";
    }

    return [
      "Shopping cart:",
      ...items.map(
        (item) =>
          `${item.name} [${item.id}]: ${item.quantity} x ${item.unitPriceInCents} cents`,
      ),
    ].join("\n");
  }

  removeItem(id: string): void {
    this.removeItemFromCart.execute(id);
  }
}
