import { InvalidItemError } from "./errors";

export interface CartItemProps {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

/** An immutable line in the cart. Prices are integer cents to avoid floating-point drift. */
export class CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;

  private constructor(props: CartItemProps) {
    this.id = props.id;
    this.name = props.name;
    this.unitPriceCents = props.unitPriceCents;
    this.quantity = props.quantity;
  }

  static create(props: CartItemProps): CartItem {
    const id = props.id.trim();
    const name = props.name.trim();
    if (id === "") throw new InvalidItemError("Item id must not be empty.");
    if (name === "") throw new InvalidItemError("Item name must not be empty.");
    if (!Number.isSafeInteger(props.unitPriceCents) || props.unitPriceCents < 0) {
      throw new InvalidItemError("Unit price must be a non-negative whole number of cents.");
    }
    if (!Number.isSafeInteger(props.quantity) || props.quantity < 1) {
      throw new InvalidItemError("Quantity must be a positive whole number.");
    }
    return new CartItem({ id, name, unitPriceCents: props.unitPriceCents, quantity: props.quantity });
  }

  get subtotalCents(): number {
    return this.unitPriceCents * this.quantity;
  }

  withQuantity(quantity: number): CartItem {
    return CartItem.create({ ...this.toProps(), quantity });
  }

  toProps(): CartItemProps {
    return { id: this.id, name: this.name, unitPriceCents: this.unitPriceCents, quantity: this.quantity };
  }
}
