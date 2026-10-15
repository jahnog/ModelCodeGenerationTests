import { DomainError } from "../shared/DomainError";

export class InvalidQuantityError extends DomainError {}

/** Value object: a positive whole number of units. */
export class Quantity {
  private constructor(readonly value: number) {}

  static of(value: number): Quantity {
    if (!Number.isInteger(value) || value < 1) {
      throw new InvalidQuantityError(`Quantity must be a positive integer, got ${value}`);
    }
    return new Quantity(value);
  }

  add(other: Quantity): Quantity {
    return Quantity.of(this.value + other.value);
  }
}
