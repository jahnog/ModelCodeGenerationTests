import { DomainError } from "../error/domain-error";

export class Quantity {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): Quantity {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new DomainError(
        "invalid-quantity",
        "Quantity must be a whole number of at least 1.",
      );
    }
    return new Quantity(value);
  }

  static sum(left: Quantity, right: Quantity): Quantity {
    const value = left.value + right.value;
    if (!Number.isSafeInteger(value)) {
      throw new DomainError(
        "quantity-overflow",
        "Quantity is outside the safe integer range.",
      );
    }
    return new Quantity(value);
  }
}
