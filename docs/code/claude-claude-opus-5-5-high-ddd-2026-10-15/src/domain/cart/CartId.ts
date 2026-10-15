import { DomainError } from "../shared/DomainError";

/** Identity of a shopping cart. */
export class CartId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): CartId {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new DomainError("Cart id must not be empty.");
    }
    return new CartId(trimmed);
  }

  equals(other: CartId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
