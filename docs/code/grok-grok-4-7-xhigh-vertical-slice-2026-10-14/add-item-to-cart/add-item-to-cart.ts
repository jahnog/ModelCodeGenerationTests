// Slice: add an item to the shopping cart.
// The request, the checks, and the response live in this file.
// This slice does not import the other slices.

import {
  copyCartLine,
  type CartLine,
  type ShoppingCart,
} from "../shared/shopping-cart";

export interface AddItemToCartRequest {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export type AddItemToCartResponse =
  | {
      readonly ok: true;
      readonly cart: ShoppingCart;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

type DraftedLine =
  | { readonly ok: true; readonly line: CartLine }
  | { readonly ok: false; readonly message: string };

export function addItemToCart(
  cart: ShoppingCart,
  request: AddItemToCartRequest,
): AddItemToCartResponse {
  const drafted = draftLine(request);
  if (!drafted.ok) {
    return drafted;
  }

  const incoming = drafted.line;
  const existing = cart.find((line) => line.productId === incoming.productId);
  if (existing === undefined) {
    return {
      ok: true,
      cart: [...cart.map(copyCartLine), incoming],
      message: addedMessage(incoming),
    };
  }

  if (
    existing.name !== incoming.name ||
    existing.unitPriceCents !== incoming.unitPriceCents
  ) {
    return {
      ok: false,
      message: `Item "${incoming.productId}" is already in the cart with a different name or price.`,
    };
  }

  const mergedQuantity = existing.quantity + incoming.quantity;
  if (!Number.isSafeInteger(mergedQuantity)) {
    return { ok: false, message: "Quantity is outside the safe integer range." };
  }

  const merged = draftLine({
    productId: existing.productId,
    name: existing.name,
    unitPriceCents: existing.unitPriceCents,
    quantity: mergedQuantity,
  });
  if (!merged.ok) {
    return merged;
  }

  return {
    ok: true,
    cart: cart.map((line) =>
      line.productId === incoming.productId ? merged.line : copyCartLine(line),
    ),
    message: `${addedMessage(incoming)} Cart quantity is now ${merged.line.quantity}.`,
  };
}

function addedMessage(line: CartLine): string {
  return `Added ${line.quantity} x ${line.name} (${line.productId}).`;
}

function draftLine(request: AddItemToCartRequest): DraftedLine {
  const productId = request.productId.trim();
  const name = request.name.trim();
  const rejection = rejectedLine(
    productId,
    name,
    request.unitPriceCents,
    request.quantity,
  );
  if (rejection !== undefined) {
    return { ok: false, message: rejection };
  }

  return {
    ok: true,
    line: {
      productId,
      name,
      unitPriceCents: request.unitPriceCents,
      quantity: request.quantity,
    },
  };
}

function rejectedLine(
  productId: string,
  name: string,
  unitPriceCents: number,
  quantity: number,
): string | undefined {
  if (productId.length === 0) {
    return "Product id must not be empty.";
  }
  if (name.length === 0) {
    return "Item name must not be empty.";
  }
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    return "Unit price must be a non-negative integer number of cents.";
  }
  if (!Number.isSafeInteger(unitPriceCents)) {
    return "Unit price is outside the safe integer range.";
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return "Quantity must be a positive integer.";
  }
  if (!Number.isSafeInteger(quantity)) {
    return "Quantity is outside the safe integer range.";
  }
  if (!Number.isSafeInteger(quantity * unitPriceCents)) {
    return "Line total is outside the safe integer range.";
  }
  return undefined;
}
