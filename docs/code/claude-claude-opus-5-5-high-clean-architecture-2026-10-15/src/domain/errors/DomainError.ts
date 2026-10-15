/** Base class for every rule violation raised by the domain layer. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidMoneyError extends DomainError {}

export class InvalidCartItemError extends DomainError {}

export class ItemNotInCartError extends DomainError {
  readonly itemId: string;

  constructor(itemId: string) {
    super(`Item "${itemId}" is not in the cart.`);
    this.itemId = itemId;
  }
}

export class ConflictingCartItemError extends DomainError {
  readonly itemId: string;

  constructor(itemId: string) {
    super(`Item "${itemId}" is already in the cart with a different name or price.`);
    this.itemId = itemId;
  }
}
