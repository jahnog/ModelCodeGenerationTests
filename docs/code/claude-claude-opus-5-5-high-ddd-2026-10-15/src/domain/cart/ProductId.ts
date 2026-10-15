import { DomainError } from "../shared/DomainError";

/** Identity of a product placed in a cart. */
export class ProductId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): ProductId {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new DomainError("Product id must not be empty.");
    }
    return new ProductId(trimmed);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
