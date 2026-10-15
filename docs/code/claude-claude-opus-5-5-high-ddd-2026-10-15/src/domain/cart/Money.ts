import { DomainError } from "../shared/DomainError";

/** An amount of money held in minor units (cents) to avoid floating-point errors. */
export class Money {
  readonly cents: number;
  readonly currency: string;

  private constructor(cents: number, currency: string) {
    this.cents = cents;
    this.currency = currency;
  }

  static ofCents(cents: number, currency: string): Money {
    if (!Number.isSafeInteger(cents)) {
      throw new DomainError(`Money must be a whole number of cents, got ${cents}.`);
    }
    if (cents < 0) {
      throw new DomainError(`Money must not be negative, got ${cents}.`);
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new DomainError(`Currency must be a 3-letter ISO code, got "${currency}".`);
    }
    return new Money(cents, currency);
  }

  static zero(currency: string): Money {
    return Money.ofCents(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.ofCents(this.cents + other.cents, this.currency);
  }

  multiply(factor: number): Money {
    return Money.ofCents(this.cents * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }

  toString(): string {
    const whole = Math.floor(this.cents / 100);
    const fraction = String(this.cents % 100).padStart(2, "0");
    return `${whole}.${fraction} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Cannot combine ${this.currency} with ${other.currency}.`);
    }
  }
}
