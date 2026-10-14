import { type ShoppingCart } from "../../domain/entity/shopping-cart";
import { type CartItem } from "../../domain/entity/cart-item";
import { type ShoppingCartRepository } from "../../domain/repository/shopping-cart-repository";
import { CartId } from "../../domain/value/cart-id";
import { type ShownCart, type ShownCartItem } from "../dto/shown-cart";
import { CartNotFound } from "../error/cart-not-found";

export interface ShowCartRequest {
  readonly cartId: string;
}

export class ShowCartItems {
  readonly #carts: ShoppingCartRepository;

  constructor(carts: ShoppingCartRepository) {
    this.#carts = carts;
  }

  execute(request: ShowCartRequest): ShownCart {
    const cartId = CartId.create(request.cartId);
    const cart = this.#carts.findById(cartId);
    if (cart === undefined) {
      throw new CartNotFound(cartId.value);
    }
    return toShownCart(cart);
  }
}

function toShownCart(cart: ShoppingCart): ShownCart {
  const items = cart.items();
  const total = cart.total();
  return {
    cartId: cart.id.value,
    lineCount: items.length,
    unitCount: cart.unitTotal(),
    items: items.map(toShownItem),
    totalMinor: total === undefined ? undefined : total.amountMinor,
    currency: total === undefined ? undefined : total.currency,
  };
}

function toShownItem(item: CartItem): ShownCartItem {
  return {
    productId: item.productId.value,
    productName: item.productName.value,
    quantity: item.quantity.value,
    unitPriceMinor: item.unitPrice.amountMinor,
    currency: item.unitPrice.currency,
    lineTotalMinor: item.lineTotal().amountMinor,
  };
}
