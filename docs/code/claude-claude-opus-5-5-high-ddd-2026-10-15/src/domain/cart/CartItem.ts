import type { Money } from "./Money";
import type { ProductId } from "./ProductId";
import type { ProductName } from "./ProductName";
import type { Quantity } from "./Quantity";

/**
 * A line in a shopping cart. An entity identified by its product within the cart.
 * Only the ShoppingCart aggregate root changes it.
 */
export class CartItem {
  readonly productId: ProductId;
  readonly name: ProductName;
  readonly unitPrice: Money;
  private _quantity: Quantity;

  constructor(productId: ProductId, name: ProductName, unitPrice: Money, quantity: Quantity) {
    this.productId = productId;
    this.name = name;
    this.unitPrice = unitPrice;
    this._quantity = quantity;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get subtotal(): Money {
    return this.unitPrice.multiply(this._quantity.value);
  }

  increaseBy(quantity: Quantity): void {
    this._quantity = this._quantity.add(quantity);
  }
}
