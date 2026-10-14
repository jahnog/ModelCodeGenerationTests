import { CartError } from "../domain/cart-error";

export function readCartError(error: unknown): string | undefined {
  if (error instanceof CartError) {
    return error.message;
  }
  return undefined;
}
