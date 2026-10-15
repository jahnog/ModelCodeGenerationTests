import { DomainError } from "../shared/DomainError";

/** A positive whole number of units. */
export class Quantity {
  static readonly MAX = 99;

  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static of(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new DomainError(`Quantity must be a whole number, got ${value}.`);
    }
    if (value < 1) {
      throw new DomainError(`Quantity must be at least 1, got ${value}.`);
    }
    if (value > Quantity.MAX) {
      throw new DomainError(`Quantity must be at most ${Quantity.MAX}, got ${value}.`);
    }
    return new Quantity(value);
  }

  add(other: Quantity): Quantity {
    return Quantity.of(this.value + other.value);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
