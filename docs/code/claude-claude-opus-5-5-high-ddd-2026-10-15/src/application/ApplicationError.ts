/** Raised when a use case cannot run, for example because the cart does not exist. */
export class CartNotFoundError extends Error {
  constructor(cartId: string) {
    super(`Cart "${cartId}" does not exist.`);
    this.name = "CartNotFoundError";
  }
}
