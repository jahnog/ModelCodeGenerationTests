import { DomainError } from "../shared/DomainError";

export class InvalidCartIdError extends DomainError {}

/** Value object: identity of a shopping cart. */
export class CartId {
  private constructor(readonly value: string) {}

  static of(value: string): CartId {
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new InvalidCartIdError("Cart id must not be empty");
    }
    return new CartId(trimmed);
  }

  equals(other: CartId): boolean {
    return this.value === other.value;
  }
}
