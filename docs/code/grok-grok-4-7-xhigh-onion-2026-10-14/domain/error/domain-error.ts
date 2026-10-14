export type DomainErrorCode =
  | "empty-product-id"
  | "product-id-too-long"
  | "empty-item-name"
  | "item-name-too-long"
  | "invalid-unit-price"
  | "invalid-quantity"
  | "quantity-overflow"
  | "line-total-overflow"
  | "total-overflow"
  | "offering-conflict"
  | "item-not-found";

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
