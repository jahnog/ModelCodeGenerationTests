import { DomainError } from "./DomainError";

export class InvalidMoneyError extends DomainError {}

/** Value object: an amount of money stored as whole cents. */
export class Money {
  private constructor(
    readonly cents: number,
    readonly currency: string,
  ) {}

  static ofCents(cents: number, currency = "USD"): Money {
    if (!Number.isSafeInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(`Amount in cents must be a non-negative integer, got ${cents}`);
    }
    return new Money(cents, currency);
  }

  static zero(currency = "USD"): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.ofCents(this.cents + other.cents, this.currency);
  }

  times(factor: number): Money {
    return Money.ofCents(this.cents * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }

  format(): string {
    const whole = Math.floor(this.cents / 100);
    const fraction = String(this.cents % 100).padStart(2, "0");
    return `${whole}.${fraction} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new InvalidMoneyError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
