import { DomainError } from "../error/domain-error";

const MAX_LENGTH = 64;

export class CartId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): CartId {
    const value = raw.trim();
    if (value.length === 0) {
      throw new DomainError("cart-id-empty", "A cart id is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        "cart-id-too-long",
        `A cart id must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new CartId(value);
  }

  equals(other: CartId): boolean {
    return this.value === other.value;
  }
}
