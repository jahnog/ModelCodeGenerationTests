import type { CartEvent, ItemAddedEvent, ItemRemovedEvent } from "./cart-event";

export interface CartLine {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface ShoppingCart {
  readonly cartId: string;
  readonly lines: readonly CartLine[];
}

export interface AddItemInput {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export type CartDecision =
  | {
      readonly ok: true;
      readonly cart: ShoppingCart;
      readonly events: readonly CartEvent[];
    }
  | {
      readonly ok: false;
      readonly reason: string;
    };

export function emptyShoppingCart(cartId: string): ShoppingCart {
  return { cartId, lines: [] };
}

export function decideAddItem(cart: ShoppingCart, input: AddItemInput): CartDecision {
  if (isBlank(cart.cartId)) {
    return rejected("A shopping cart id is required.");
  }

  const itemId = input.itemId.trim();
  if (itemId === "") {
    return rejected("An item id is required.");
  }

  const name = input.name.trim();
  if (name === "") {
    return rejected("An item name is required.");
  }

  if (!isPositiveInteger(input.quantity)) {
    return rejected("Quantity must be a positive whole number.");
  }

  if (!isNonNegativeInteger(input.unitPriceCents)) {
    return rejected("Unit price must be a whole number of cents and cannot be negative.");
  }

  const existing = cart.lines.find((line) => line.itemId === itemId);
  if (existing !== undefined && existing.name !== name) {
    return rejected(`Item ${itemId} is already in the cart as ${existing.name}.`);
  }
  if (existing !== undefined && existing.unitPriceCents !== input.unitPriceCents) {
    return rejected(`Item ${itemId} is already in the cart at a different price.`);
  }

  const resultingQuantity = combinedQuantity(existing?.quantity, input.quantity);
  if (
    resultingQuantity === undefined ||
    lineTotalCents(input.unitPriceCents, resultingQuantity) === undefined
  ) {
    return rejected("That quantity costs more than this cart can record.");
  }

  const lines =
    existing === undefined
      ? [...cart.lines, { itemId, name, unitPriceCents: input.unitPriceCents, quantity: resultingQuantity }]
      : cart.lines.map((line) =>
          line.itemId === itemId ? { ...line, quantity: resultingQuantity } : line,
        );

  if (!totalsAreSafe(lines)) {
    return rejected("That quantity costs more than this cart can record.");
  }

  const event: ItemAddedEvent = {
    type: "ItemAdded",
    cartId: cart.cartId,
    itemId,
    name,
    unitPriceCents: input.unitPriceCents,
    quantityAdded: input.quantity,
    resultingQuantity,
  };

  return accepted({ cartId: cart.cartId, lines }, [event]);
}

export function decideRemoveItem(cart: ShoppingCart, itemId: string): CartDecision {
  if (isBlank(cart.cartId)) {
    return rejected("A shopping cart id is required.");
  }

  const id = itemId.trim();
  if (id === "") {
    return rejected("An item id is required.");
  }

  const existing = cart.lines.find((line) => line.itemId === id);
  if (existing === undefined) {
    return rejected(`Item ${id} is not in the shopping cart.`);
  }

  const event: ItemRemovedEvent = {
    type: "ItemRemoved",
    cartId: cart.cartId,
    itemId: id,
    name: existing.name,
    quantity: existing.quantity,
  };

  return accepted(
    {
      cartId: cart.cartId,
      lines: cart.lines.filter((line) => line.itemId !== id),
    },
    [event],
  );
}

function combinedQuantity(current: number | undefined, added: number): number | undefined {
  if (current === undefined) {
    return added;
  }
  if (current > Number.MAX_SAFE_INTEGER - added) {
    return undefined;
  }
  return current + added;
}

function totalsAreSafe(lines: readonly CartLine[]): boolean {
  let total = 0;
  for (const line of lines) {
    const lineTotal = lineTotalCents(line.unitPriceCents, line.quantity);
    if (lineTotal === undefined || total > Number.MAX_SAFE_INTEGER - lineTotal) {
      return false;
    }
    total += lineTotal;
  }
  return true;
}

function lineTotalCents(unitPriceCents: number, quantity: number): number | undefined {
  if (!Number.isSafeInteger(unitPriceCents) || !Number.isSafeInteger(quantity)) {
    return undefined;
  }
  if (unitPriceCents < 0 || quantity < 0) {
    return undefined;
  }
  if (quantity !== 0 && unitPriceCents > Math.floor(Number.MAX_SAFE_INTEGER / quantity)) {
    return undefined;
  }
  return unitPriceCents * quantity;
}

function accepted(cart: ShoppingCart, events: readonly CartEvent[]): CartDecision {
  return { ok: true, cart, events };
}

function rejected(reason: string): CartDecision {
  return { ok: false, reason };
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

function isPositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}
