import { InvalidCartItemError } from "./errors";

export interface CartItemProps {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/** Immutable value object: one product line in a cart. Prices are integer cents. */
export class CartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;

  private constructor(props: CartItemProps) {
    this.productId = props.productId;
    this.name = props.name;
    this.unitPriceCents = props.unitPriceCents;
    this.quantity = props.quantity;
  }

  static create(props: CartItemProps): CartItem {
    const productId = props.productId.trim();
    const name = props.name.trim();
    if (productId === "") throw new InvalidCartItemError("Product id must not be empty.");
    if (name === "") throw new InvalidCartItemError("Item name must not be empty.");
    if (!Number.isInteger(props.unitPriceCents) || props.unitPriceCents < 0) {
      throw new InvalidCartItemError("Unit price must be a non-negative integer number of cents.");
    }
    if (!Number.isInteger(props.quantity) || props.quantity < 1) {
      throw new InvalidCartItemError("Quantity must be a positive integer.");
    }
    return new CartItem({ ...props, productId, name });
  }

  get subtotalCents(): number {
    return this.unitPriceCents * this.quantity;
  }

  withAddedQuantity(quantity: number): CartItem {
    return CartItem.create({ ...this, quantity: this.quantity + quantity });
  }
}
