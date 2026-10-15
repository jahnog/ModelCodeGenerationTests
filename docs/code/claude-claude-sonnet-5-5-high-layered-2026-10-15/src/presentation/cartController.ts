import { CartError } from "../domain/errors";
import type { CartService, NewItem } from "../service/cartService";
import { formatMoney, renderCart } from "./cartView";

export type CartCommand =
  | { readonly kind: "add"; readonly item: NewItem }
  | { readonly kind: "show" }
  | { readonly kind: "remove"; readonly id: string };

/** Presentation layer: turns a command into a message for the user. */
export class CartController {
  constructor(private readonly service: CartService) {}

  handle(command: CartCommand): string {
    try {
      switch (command.kind) {
        case "add": {
          const item = this.service.addItem(command.item);
          return `Added ${command.item.quantity} x ${item.name} (now ${item.quantity} in cart, ${formatMoney(item.unitPriceCents)} each).`;
        }
        case "show":
          return renderCart(this.service.listItems(), this.service.totalCents());
        case "remove": {
          const item = this.service.removeItem(command.id);
          return `Removed ${item.name} from the cart.`;
        }
      }
    } catch (error) {
      if (error instanceof CartError) return `Error: ${error.message}`;
      throw error;
    }
  }
}
