import { type Brand } from "./brand";
import { CartProblem, type CartError } from "./cart-error";
import { multiplyCents, parseCents, parseQuantity, type Cents, type Quantity } from "./money";
import { err, ok, type Result } from "./result";

const ITEM_ID_MAX_LENGTH = 64;
const ITEM_NAME_MAX_LENGTH = 120;
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F\u2028\u2029]/u;

export type ItemId = Brand<string, "ItemId">;

export type ItemName = Brand<string, "ItemName">;

export interface ItemDraft {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface Item {
  readonly id: ItemId;
  readonly name: ItemName;
  readonly unitPriceCents: Cents;
  readonly quantity: Quantity;
  readonly lineTotalCents: Cents;
}

/** Validated text is branded here. The cast does not validate again. */
function trustedItemId(value: string): ItemId {
  return value as ItemId;
}

function trustedItemName(value: string): ItemName {
  return value as ItemName;
}

export function parseItemId(value: string): Result<ItemId, CartError> {
  const canonical = canonicalText(value, ITEM_ID_MAX_LENGTH);
  if (canonical === undefined) {
    return err({ kind: CartProblem.invalidId });
  }
  return ok(trustedItemId(canonical));
}

export function createItem(draft: ItemDraft): Result<Item, CartError> {
  const id = parseItemId(draft.id);
  if (!id.ok) {
    return id;
  }
  const name = parseItemName(draft.name);
  if (!name.ok) {
    return name;
  }
  const unitPriceCents = parseCents(draft.unitPriceCents);
  if (!unitPriceCents.ok) {
    return unitPriceCents;
  }
  const quantity = parseQuantity(draft.quantity);
  if (!quantity.ok) {
    return quantity;
  }
  const lineTotalCents = multiplyCents(unitPriceCents.value, quantity.value);
  if (!lineTotalCents.ok) {
    return lineTotalCents;
  }
  return ok(
    copyItem({
      id: id.value,
      name: name.value,
      unitPriceCents: unitPriceCents.value,
      quantity: quantity.value,
      lineTotalCents: lineTotalCents.value,
    }),
  );
}

export function replaceQuantity(item: Item, quantity: Quantity): Result<Item, CartError> {
  const lineTotalCents = multiplyCents(item.unitPriceCents, quantity);
  if (!lineTotalCents.ok) {
    return lineTotalCents;
  }
  return ok(
    copyItem({
      id: item.id,
      name: item.name,
      unitPriceCents: item.unitPriceCents,
      quantity,
      lineTotalCents: lineTotalCents.value,
    }),
  );
}

function parseItemName(value: string): Result<ItemName, CartError> {
  const canonical = canonicalText(value, ITEM_NAME_MAX_LENGTH);
  if (canonical === undefined) {
    return err({ kind: CartProblem.invalidName });
  }
  return ok(trustedItemName(canonical));
}

function canonicalText(value: string, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const canonical = value.normalize("NFC").trim();
  if (canonical.length === 0 || canonical.length > maxLength) {
    return undefined;
  }
  if (CONTROL_CHARACTER.test(canonical)) {
    return undefined;
  }
  return canonical;
}

function copyItem(item: Item): Item {
  return Object.freeze({
    id: item.id,
    name: item.name,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.lineTotalCents,
  });
}
