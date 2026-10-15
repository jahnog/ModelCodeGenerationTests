import { DomainError } from "../shared/DomainError";

export class InvalidProductIdError extends DomainError {}

/** Value object: identity of a product (and of its line in a cart). */
export class ProductId {
  private constructor(readonly value: string) {}

  static of(value: string): ProductId {
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new InvalidProductIdError("Product id must not be empty");
    }
    return new ProductId(trimmed);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
