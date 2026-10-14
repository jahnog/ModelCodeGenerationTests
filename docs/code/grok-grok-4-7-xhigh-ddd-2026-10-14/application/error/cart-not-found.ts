export class ApplicationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class CartNotFound extends ApplicationError {
  constructor(cartId: string) {
    super("cart-not-found", `Shopping cart "${cartId}" was not found.`);
  }
}
