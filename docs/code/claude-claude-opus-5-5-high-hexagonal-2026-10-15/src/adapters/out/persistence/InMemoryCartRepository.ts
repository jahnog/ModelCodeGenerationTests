import type { CartRepository } from "../../../application/ports/out/CartRepository";
import { Cart } from "../../../domain/Cart";
import { CartItem } from "../../../domain/CartItem";
import { Money } from "../../../domain/Money";

interface StoredCartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/**
 * Driven adapter that keeps carts in memory. It stores plain records rather than the
 * Cart objects themselves, so a change only persists once the application calls save().
 */
export class InMemoryCartRepository implements CartRepository {
  private readonly records = new Map<string, readonly StoredCartItem[]>();

  async findById(cartId: string): Promise<Cart | undefined> {
    const stored = this.records.get(cartId);
    if (stored === undefined) {
      return undefined;
    }
    return Cart.restore(
      cartId,
      stored.map(
        (item) =>
          new CartItem(item.productId, item.name, Money.ofCents(item.unitPriceCents), item.quantity),
      ),
    );
  }

  async save(cart: Cart): Promise<void> {
    this.records.set(
      cart.id,
      cart.items().map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPriceCents: item.unitPrice.cents,
        quantity: item.quantity,
      })),
    );
  }
}
