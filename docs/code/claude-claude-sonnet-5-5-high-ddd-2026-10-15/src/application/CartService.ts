import { Cart } from "../domain/cart/Cart";
import { CartId } from "../domain/cart/CartId";
import { CartItem } from "../domain/cart/CartItem";
import { CartRepository } from "../domain/cart/CartRepository";
import { ProductId } from "../domain/cart/ProductId";
import { Quantity } from "../domain/cart/Quantity";
import { Money } from "../domain/shared/Money";

export interface AddItemCommand {
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemCommand {
  readonly cartId: string;
  readonly productId: string;
}

export interface CartItemView {
  readonly productId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: string;
  readonly total: string;
}

export interface CartView {
  readonly cartId: string;
  readonly items: readonly CartItemView[];
  readonly total: string;
}

/** Application service: orchestrates use cases, holds no business rules. */
export class CartService {
  constructor(private readonly carts: CartRepository) {}

  addItem(command: AddItemCommand): void {
    const cart = this.loadOrCreate(CartId.of(command.cartId));
    cart.addItem(
      CartItem.create(
        ProductId.of(command.productId),
        command.name,
        Money.ofCents(command.unitPriceCents),
        Quantity.of(command.quantity),
      ),
    );
    this.carts.save(cart);
  }

  removeItem(command: RemoveItemCommand): void {
    const cart = this.loadOrCreate(CartId.of(command.cartId));
    cart.removeItem(ProductId.of(command.productId));
    this.carts.save(cart);
  }

  showCart(cartId: string): CartView {
    const cart = this.loadOrCreate(CartId.of(cartId));
    return {
      cartId: cart.id.value,
      items: cart.listItems.map((item) => ({
        productId: item.productId.value,
        name: item.name,
        quantity: item.quantity.value,
        unitPrice: item.unitPrice.format(),
        total: item.total.format(),
      })),
      total: cart.total.format(),
    };
  }

  private loadOrCreate(id: CartId): Cart {
    return this.carts.findById(id) ?? Cart.create(id);
  }
}
