import { InvalidMoneyError } from "./errors";

/** An amount of money stored as whole cents to avoid floating-point rounding. */
export class Money {
  static readonly ZERO = new Money(0);

  readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static ofCents(cents: number): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(cents);
    }
    return new Money(cents);
  }

  add(other: Money): Money {
    return Money.ofCents(this.cents + other.cents);
  }

  times(factor: number): Money {
    return Money.ofCents(this.cents * factor);
  }
}
