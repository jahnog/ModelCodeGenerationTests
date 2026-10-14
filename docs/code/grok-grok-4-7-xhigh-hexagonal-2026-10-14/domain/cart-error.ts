export type CartErrorCode =
  | "empty-id"
  | "empty-name"
  | "invalid-price"
  | "invalid-quantity"
  | "unsafe-total"
  | "item-conflict"
  | "item-not-found";

export class CartError extends Error {
  readonly code: CartErrorCode;

  constructor(code: CartErrorCode, message: string) {
    super(message);
    this.name = "CartError";
    this.code = code;
  }
}
