import type { CartState } from "./cart-state";
import type {
  AddItemRejected,
  AddItemRequested,
  ItemAddedToCart,
  ItemRemovedFromCart,
  RemoveItemRejected,
  RemoveItemRequested,
} from "../events/cart-message";

export function decideAdd(
  state: CartState,
  request: AddItemRequested,
): ItemAddedToCart | AddItemRejected {
  const itemId = request.itemId.trim();
  const name = request.name.trim();
  if (itemId.length === 0) {
    return rejectAdd(request.itemId, "Item id is required.");
  }
  if (name.length === 0) {
    return rejectAdd(itemId, "Item name is required.");
  }
  if (!Number.isSafeInteger(request.unitPriceCents) || request.unitPriceCents < 0) {
    return rejectAdd(itemId, "Unit price must be a whole number of cents and cannot be negative.");
  }
  if (!Number.isSafeInteger(request.quantity) || request.quantity < 1) {
    return rejectAdd(itemId, "Quantity must be a positive whole number.");
  }

  const existing = state.lines.find((line) => line.itemId === itemId);
  if (
    existing !== undefined &&
    (existing.name !== name || existing.unitPriceCents !== request.unitPriceCents)
  ) {
    return rejectAdd(itemId, "This item is already in the cart with a different name or price.");
  }

  const resultingQuantity = (existing?.quantity ?? 0) + request.quantity;
  if (!Number.isSafeInteger(resultingQuantity)) {
    return rejectAdd(itemId, "Quantity is too large.");
  }

  return {
    type: "ItemAddedToCart",
    itemId,
    name,
    unitPriceCents: request.unitPriceCents,
    quantity: request.quantity,
    resultingQuantity,
  };
}

export function decideRemove(
  state: CartState,
  request: RemoveItemRequested,
): ItemRemovedFromCart | RemoveItemRejected {
  const itemId = request.itemId.trim();
  if (itemId.length === 0) {
    return rejectRemove(request.itemId, "Item id is required.");
  }
  if (!Number.isSafeInteger(request.quantity) || request.quantity < 1) {
    return rejectRemove(itemId, "Quantity must be a positive whole number.");
  }

  const existing = state.lines.find((line) => line.itemId === itemId);
  if (existing === undefined) {
    return rejectRemove(itemId, "That item is not in the cart.");
  }
  if (request.quantity > existing.quantity) {
    return rejectRemove(itemId, "Cannot remove more than the quantity in the cart.");
  }

  return {
    type: "ItemRemovedFromCart",
    itemId,
    name: existing.name,
    unitPriceCents: existing.unitPriceCents,
    quantity: request.quantity,
    remainingQuantity: existing.quantity - request.quantity,
  };
}

function rejectAdd(itemId: string, reason: string): AddItemRejected {
  return { type: "AddItemRejected", itemId, reason };
}

function rejectRemove(itemId: string, reason: string): RemoveItemRejected {
  return { type: "RemoveItemRejected", itemId, reason };
}
