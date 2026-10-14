import { DomainError } from "../error/domain-error";
import { type Quantity } from "./quantity";

export class Money {
  readonly amountMinor: number;
  readonly currency: string;

  private constructor(amountMinor: number, currency: string) {
    this.amountMinor = amountMinor;
    this.currency = currency;
  }

  static create(amountMinor: number, currency: string): Money {
    if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
      throw new DomainError(
        "money-invalid",
        "A price must be a whole number of minor units and cannot be negative.",
      );
    }
    const code = currency.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new DomainError(
        "currency-invalid",
        "A currency must be a three-letter code.",
      );
    }
    return new Money(amountMinor, code);
  }

  hasSameCurrency(other: Money): boolean {
    return this.currency === other.currency;
  }

  plus(other: Money): Money {
    if (!this.hasSameCurrency(other)) {
      throw new DomainError(
        "currency-mismatch",
        `Cannot add ${other.currency} to ${this.currency}.`,
      );
    }
    const amountMinor = this.amountMinor + other.amountMinor;
    if (!Number.isSafeInteger(amountMinor)) {
      throw new DomainError("money-overflow", "The amount is too large.");
    }
    return new Money(amountMinor, this.currency);
  }

  times(quantity: Quantity): Money {
    const amountMinor = this.amountMinor * quantity.value;
    if (!Number.isSafeInteger(amountMinor)) {
      throw new DomainError("money-overflow", "The amount is too large.");
    }
    return new Money(amountMinor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amountMinor === other.amountMinor && this.hasSameCurrency(other);
  }
}
