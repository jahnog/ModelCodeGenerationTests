export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Quantity must be a positive integer, received ${quantity}.`);
  }
}

export class InvalidPriceError extends DomainError {
  constructor(priceInCents: number) {
    super(`Price must be a non-negative integer number of cents, received ${priceInCents}.`);
  }
}

export class ItemNotInCartError extends DomainError {
  constructor(productId: string) {
    super(`Item "${productId}" is not in the cart.`);
  }
}
