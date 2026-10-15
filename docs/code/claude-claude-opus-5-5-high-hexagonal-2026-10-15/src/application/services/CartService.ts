import { Cart } from "../../domain/Cart";
import { CartItem } from "../../domain/CartItem";
import { Money } from "../../domain/Money";
import type { AddItemToCartCommand, AddItemToCartUseCase } from "../ports/in/AddItemToCart";
import type { CartView } from "../ports/in/CartView";
import type {
  RemoveItemFromCartCommand,
  RemoveItemFromCartUseCase,
} from "../ports/in/RemoveItemFromCart";
import type { ViewCartQuery } from "../ports/in/ViewCart";
import type { CartRepository } from "../ports/out/CartRepository";

/** Implements the inbound ports by orchestrating the domain and the outbound repository port. */
export class CartService implements AddItemToCartUseCase, ViewCartQuery, RemoveItemFromCartUseCase {
  private readonly carts: CartRepository;

  constructor(carts: CartRepository) {
    this.carts = carts;
  }

  async addItem(command: AddItemToCartCommand): Promise<CartView> {
    const cart = await this.loadOrCreate(command.cartId);
    cart.addItem(
      new CartItem(
        command.productId,
        command.name,
        Money.ofCents(command.unitPriceCents),
        command.quantity,
      ),
    );
    await this.carts.save(cart);
    return toView(cart);
  }

  async viewCart(cartId: string): Promise<CartView> {
    return toView(await this.loadOrCreate(cartId));
  }

  async removeItem(command: RemoveItemFromCartCommand): Promise<CartView> {
    const cart = await this.loadOrCreate(command.cartId);
    cart.removeItem(command.productId);
    await this.carts.save(cart);
    return toView(cart);
  }

  private async loadOrCreate(cartId: string): Promise<Cart> {
    return (await this.carts.findById(cartId)) ?? Cart.empty(cartId);
  }
}

function toView(cart: Cart): CartView {
  return {
    cartId: cart.id,
    items: cart.items().map((item) => ({
      productId: item.productId,
      name: item.name,
      unitPriceCents: item.unitPrice.cents,
      quantity: item.quantity,
      subtotalCents: item.subtotal().cents,
    })),
    totalQuantity: cart.totalQuantity(),
    totalCents: cart.total().cents,
  };
}
