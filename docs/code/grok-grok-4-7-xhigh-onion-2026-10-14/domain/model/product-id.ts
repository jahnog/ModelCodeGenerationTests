import { DomainError } from "../error/domain-error";

const MAX_PRODUCT_ID_LENGTH = 64;

export class ProductId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ProductId {
    const value = raw.trim();
    if (value.length === 0) {
      throw new DomainError("empty-product-id", "Product id must not be empty.");
    }
    if (value.length > MAX_PRODUCT_ID_LENGTH) {
      throw new DomainError(
        "product-id-too-long",
        `Product id must be at most ${MAX_PRODUCT_ID_LENGTH} characters.`,
      );
    }
    return new ProductId(value);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
