import type { CartLine, CartStore, ProductId } from "../../shared/cart-store";
import { isValidCents, type Cents } from "../../shared/money";
import { err, ok, type Result } from "../../shared/result";

export interface AddItemCommand {
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: Cents;
  readonly quantity: number;
}

export type AddItemError =
  | { readonly kind: "invalid-product-id" }
  | { readonly kind: "invalid-name" }
  | { readonly kind: "invalid-price" }
  | { readonly kind: "invalid-quantity" }
  | { readonly kind: "price-mismatch"; readonly existingPriceCents: Cents };

export const addItem = (
  store: CartStore,
  command: AddItemCommand,
): Result<CartLine, AddItemError> => {
  const productId = command.productId.trim();
  const name = command.name.trim();

  if (productId === "") return err({ kind: "invalid-product-id" });
  if (name === "") return err({ kind: "invalid-name" });
  if (!isValidCents(command.unitPriceCents)) return err({ kind: "invalid-price" });
  if (!Number.isSafeInteger(command.quantity) || command.quantity < 1) {
    return err({ kind: "invalid-quantity" });
  }

  const lines = store.load();
  const existing = lines.find((line) => line.productId === productId);

  if (existing === undefined) {
    const created: CartLine = {
      productId,
      name,
      unitPriceCents: command.unitPriceCents,
      quantity: command.quantity,
    };
    store.save([...lines, created]);
    return ok(created);
  }

  if (existing.unitPriceCents !== command.unitPriceCents) {
    return err({ kind: "price-mismatch", existingPriceCents: existing.unitPriceCents });
  }

  const updated: CartLine = { ...existing, quantity: existing.quantity + command.quantity };
  store.save(lines.map((line) => (line.productId === productId ? updated : line)));
  return ok(updated);
};
