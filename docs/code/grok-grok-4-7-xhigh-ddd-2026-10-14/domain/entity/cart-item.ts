import { type Money } from "../value/money";
import { type ProductId } from "../value/product-id";
import { type ProductName } from "../value/product-name";
import { type Quantity } from "../value/quantity";

export class CartItem {
  readonly productId: ProductId;
  readonly productName: ProductName;
  readonly unitPrice: Money;
  readonly quantity: Quantity;

  private constructor(
    productId: ProductId,
    productName: ProductName,
    unitPrice: Money,
    quantity: Quantity,
  ) {
    this.productId = productId;
    this.productName = productName;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  static create(
    productId: ProductId,
    productName: ProductName,
    unitPrice: Money,
    quantity: Quantity,
  ): CartItem {
    return new CartItem(productId, productName, unitPrice, quantity);
  }

  isFor(productId: ProductId): boolean {
    return this.productId.equals(productId);
  }

  sameIdentityAs(other: CartItem): boolean {
    return this.isFor(other.productId);
  }

  withAddedQuantity(extra: Quantity): CartItem {
    return CartItem.create(
      this.productId,
      this.productName,
      this.unitPrice,
      this.quantity.plus(extra),
    );
  }

  lineTotal(): Money {
    return this.unitPrice.times(this.quantity);
  }
}
