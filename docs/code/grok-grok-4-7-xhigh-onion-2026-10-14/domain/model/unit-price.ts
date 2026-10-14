import { DomainError } from "../error/domain-error";

export class UnitPrice {
  readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static create(cents: number): UnitPrice {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new DomainError(
        "invalid-unit-price",
        "Unit price must be a whole number of cents and must not be negative.",
      );
    }
    return new UnitPrice(cents);
  }

  equals(other: UnitPrice): boolean {
    return this.cents === other.cents;
  }
}
