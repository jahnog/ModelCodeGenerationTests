/** Domain layer: errors raised by business rules. */
export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

export class InvalidItemError extends CartError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidItemError";
  }
}

export class ItemNotFoundError extends CartError {
  constructor(readonly itemId: string) {
    super(`Item "${itemId}" is not in the cart.`);
    this.name = "ItemNotFoundError";
  }
}
