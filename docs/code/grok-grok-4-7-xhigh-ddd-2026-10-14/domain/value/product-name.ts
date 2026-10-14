import { DomainError } from "../error/domain-error";

const MAX_LENGTH = 80;

export class ProductName {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ProductName {
    const value = raw.trim();
    if (value.length === 0) {
      throw new DomainError("product-name-empty", "A product name is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        "product-name-too-long",
        `A product name must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new ProductName(value);
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }
}
