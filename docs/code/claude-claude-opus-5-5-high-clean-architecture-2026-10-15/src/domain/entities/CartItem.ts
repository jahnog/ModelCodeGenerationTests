import { InvalidCartItemError } from "../errors/DomainError";
import { Money } from "../value-objects/Money";

export interface CartItemProps {
  readonly id: string;
  readonly name: string;
  readonly unitPrice: Money;
  readonly quantity: number;
}

/** One line of the cart: a product and how many units of it the shopper wants. */
export class CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPrice: Money;
  readonly quantity: number;

  private constructor(props: CartItemProps) {
    this.id = props.id;
    this.name = props.name;
    this.unitPrice = props.unitPrice;
    this.quantity = props.quantity;
  }

  static create(props: CartItemProps): CartItem {
    const id = props.id.trim();
    const name = props.name.trim();
    if (id === "") {
      throw new InvalidCartItemError("Item id must not be empty.");
    }
    if (name === "") {
      throw new InvalidCartItemError("Item name must not be empty.");
    }
    CartItem.assertValidQuantity(props.quantity);
    return new CartItem({ ...props, id, name });
  }

  subtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  isSameProductAs(other: CartItem): boolean {
    return this.id === other.id && this.name === other.name && this.unitPrice.equals(other.unitPrice);
  }

  withAddedQuantity(quantity: number): CartItem {
    CartItem.assertValidQuantity(quantity);
    return CartItem.create({ ...this.props(), quantity: this.quantity + quantity });
  }

  private props(): CartItemProps {
    return { id: this.id, name: this.name, unitPrice: this.unitPrice, quantity: this.quantity };
  }

  private static assertValidQuantity(quantity: number): void {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new InvalidCartItemError(`Quantity must be a positive whole number, got ${quantity}.`);
    }
  }
}
