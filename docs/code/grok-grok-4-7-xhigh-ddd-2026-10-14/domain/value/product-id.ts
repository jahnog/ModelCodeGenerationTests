import { DomainError } from "../error/domain-error";

const MAX_LENGTH = 64;

export class ProductId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ProductId {
    const value = raw.trim();
    if (value.length === 0) {
      throw new DomainError("product-id-empty", "A product id is required.");
    }
    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        "product-id-too-long",
        `A product id must be at most ${MAX_LENGTH} characters.`,
      );
    }
    return new ProductId(value);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
