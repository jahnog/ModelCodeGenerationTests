import { DomainError } from "../error/domain-error";

export class Quantity {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(raw: number): Quantity {
    if (!Number.isSafeInteger(raw) || raw < 1) {
      throw new DomainError(
        "quantity-invalid",
        "Quantity must be a whole number of at least 1.",
      );
    }
    return new Quantity(raw);
  }

  plus(other: Quantity): Quantity {
    const value = this.value + other.value;
    if (!Number.isSafeInteger(value)) {
      throw new DomainError("quantity-overflow", "Quantity is too large.");
    }
    return new Quantity(value);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
