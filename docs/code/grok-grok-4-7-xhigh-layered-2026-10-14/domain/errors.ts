export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidItemError extends DomainError {}

export class ItemConflictError extends DomainError {}

export class ItemNotFoundError extends DomainError {}

export class AmountOverflowError extends DomainError {}
