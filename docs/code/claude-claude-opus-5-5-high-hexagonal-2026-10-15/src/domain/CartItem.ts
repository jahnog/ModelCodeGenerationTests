import { InvalidProductError, InvalidQuantityError } from "./errors";
import { Money } from "./Money";

/** One line of the cart: a product, its unit price and how many units are in the cart. */
export class CartItem {
  readonly productId: string;
  readonly name: string;
  readonly unitPrice: Money;
  readonly quantity: number;

  constructor(productId: string, name: string, unitPrice: Money, quantity: number) {
    const trimmedId = productId.trim();
    const trimmedName = name.trim();
    if (trimmedId === "") {
      throw new InvalidProductError("Product id must not be empty.");
    }
    if (trimmedName === "") {
      throw new InvalidProductError("Product name must not be empty.");
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new InvalidQuantityError(quantity);
    }
    this.productId = trimmedId;
    this.name = trimmedName;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  withAddedQuantity(extra: number): CartItem {
    if (!Number.isSafeInteger(extra) || extra <= 0) {
      throw new InvalidQuantityError(extra);
    }
    return new CartItem(this.productId, this.name, this.unitPrice, this.quantity + extra);
  }

  subtotal(): Money {
    return this.unitPrice.times(this.quantity);
  }
}
