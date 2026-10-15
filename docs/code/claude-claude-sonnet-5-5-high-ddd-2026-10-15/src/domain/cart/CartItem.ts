import { DomainError } from "../shared/DomainError";
import { Money } from "../shared/Money";
import { ProductId } from "./ProductId";
import { Quantity } from "./Quantity";

export class InvalidCartItemError extends DomainError {}

/** Entity inside the Cart aggregate, identified by its product id. */
export class CartItem {
  private constructor(
    readonly productId: ProductId,
    readonly name: string,
    readonly unitPrice: Money,
    readonly quantity: Quantity,
  ) {}

  static create(productId: ProductId, name: string, unitPrice: Money, quantity: Quantity): CartItem {
    const trimmed = name.trim();
    if (trimmed === "") {
      throw new InvalidCartItemError("Item name must not be empty");
    }
    return new CartItem(productId, trimmed, unitPrice, quantity);
  }

  withAddedQuantity(extra: Quantity): CartItem {
    return new CartItem(this.productId, this.name, this.unitPrice, this.quantity.add(extra));
  }

  get total(): Money {
    return this.unitPrice.times(this.quantity.value);
  }
}
