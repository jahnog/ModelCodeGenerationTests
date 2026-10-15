export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidCartItemError extends DomainError {}

export class ItemNotInCartError extends DomainError {
  constructor(productId: string) {
    super(`Item "${productId}" is not in the cart.`);
  }
}
