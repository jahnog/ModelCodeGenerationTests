import { DomainError } from "../shared/DomainError";

/** Human-readable name of a product. */
export class ProductName {
  static readonly MAX_LENGTH = 100;

  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): ProductName {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new DomainError("Product name must not be empty.");
    }
    if (trimmed.length > ProductName.MAX_LENGTH) {
      throw new DomainError(`Product name must be at most ${ProductName.MAX_LENGTH} characters.`);
    }
    return new ProductName(trimmed);
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
