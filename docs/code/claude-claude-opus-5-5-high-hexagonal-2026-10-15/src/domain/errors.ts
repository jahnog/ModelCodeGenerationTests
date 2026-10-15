export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(cents: number) {
    super(`Money must be a non-negative whole number of cents, got ${cents}.`);
  }
}

export class InvalidQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Quantity must be a positive whole number, got ${quantity}.`);
  }
}

export class InvalidProductError extends DomainError {}

export class ItemNotInCartError extends DomainError {
  constructor(productId: string) {
    super(`Item "${productId}" is not in the cart.`);
  }
}

export class InvalidCartError extends DomainError {}
