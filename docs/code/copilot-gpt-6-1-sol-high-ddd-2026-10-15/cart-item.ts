/** An immutable cart line, identified by its product ID. */
export class CartItem {
  readonly productId: string;
  readonly name: string;
  readonly quantity: number;

  constructor(productId: string, name: string, quantity = 1) {
    if (productId.trim().length === 0) {
      throw new Error("Product ID must not be empty.");
    }
    if (name.trim().length === 0) {
      throw new Error("Item name must not be empty.");
    }
    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new RangeError("Quantity must be a positive safe integer.");
    }

    this.productId = productId;
    this.name = name.trim();
    this.quantity = quantity;
    Object.freeze(this);
  }
}
