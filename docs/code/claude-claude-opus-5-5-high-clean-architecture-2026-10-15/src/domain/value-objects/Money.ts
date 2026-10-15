import { InvalidMoneyError } from "../errors/DomainError";

/** An immutable, non-negative amount of money stored in integer cents to avoid float rounding. */
export class Money {
  static readonly ZERO = new Money(0);

  private constructor(readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(`Amount must be a non-negative whole number of cents, got ${cents}.`);
    }
    return new Money(cents);
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  multiply(factor: number): Money {
    return Money.fromCents(this.cents * factor);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}
