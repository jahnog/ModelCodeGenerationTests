import type { CartStore, ProductId } from "../../shared/cart-store";
import { err, ok, type Result } from "../../shared/result";

export interface RemoveItemCommand {
  readonly productId: ProductId;
  /** Units to remove. Omit to remove the whole line. */
  readonly quantity?: number;
}

export type RemoveItemError =
  | { readonly kind: "not-in-cart"; readonly productId: ProductId }
  | { readonly kind: "invalid-quantity" };

export interface RemoveItemOutcome {
  readonly productId: ProductId;
  readonly removedQuantity: number;
  readonly remainingQuantity: number;
}

export const removeItem = (
  store: CartStore,
  command: RemoveItemCommand,
): Result<RemoveItemOutcome, RemoveItemError> => {
  const productId = command.productId.trim();
  const lines = store.load();
  const existing = lines.find((line) => line.productId === productId);

  if (existing === undefined) return err({ kind: "not-in-cart", productId });

  const requested = command.quantity ?? existing.quantity;
  if (!Number.isSafeInteger(requested) || requested < 1) {
    return err({ kind: "invalid-quantity" });
  }

  const removedQuantity = Math.min(requested, existing.quantity);
  const remainingQuantity = existing.quantity - removedQuantity;

  store.save(
    remainingQuantity === 0
      ? lines.filter((line) => line.productId !== productId)
      : lines.map((line) =>
          line.productId === productId ? { ...line, quantity: remainingQuantity } : line,
        ),
  );
  return ok({ productId, removedQuantity, remainingQuantity });
};
