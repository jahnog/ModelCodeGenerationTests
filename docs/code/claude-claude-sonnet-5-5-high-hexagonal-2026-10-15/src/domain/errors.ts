export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidItemError extends DomainError {}

export class ItemNotFoundError extends DomainError {
  constructor(readonly itemId: string) {
    super(`Item "${itemId}" is not in the cart`);
  }
}
