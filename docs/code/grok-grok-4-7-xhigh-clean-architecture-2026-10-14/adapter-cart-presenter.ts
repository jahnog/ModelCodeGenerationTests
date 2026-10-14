// Interface adapter. Turns use-case response models into text and view data.

import type { CartError } from "./domain-cart-error";
import type { CartLine, ShownCart } from "./application-shown-cart";
import type { AddItemToCartResult } from "./application-use-case-add-item-to-cart";
import type { RemoveItemFromCartResult } from "./application-use-case-remove-item-from-cart";

export interface CartLineView {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
  readonly text: string;
}

export interface CartView {
  readonly lines: readonly CartLineView[];
  readonly totalCents: number;
  readonly text: string;
}

export type AddItemView =
  | {
      readonly ok: true;
      readonly message: string;
      readonly item: CartLineView;
      readonly cart: CartView;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export type RemoveItemView =
  | {
      readonly ok: true;
      readonly message: string;
      readonly removed: CartLineView;
      readonly cart: CartView;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

export interface CartPresenter {
  presentCart(cart: ShownCart): CartView;
  presentAdded(result: AddItemToCartResult): AddItemView;
  presentRemoved(result: RemoveItemFromCartResult): RemoveItemView;
}

export class TextCartPresenter implements CartPresenter {
  presentCart(cart: ShownCart): CartView {
    const lines = cart.lines.map((line) => toLineView(line));
    return {
      lines,
      totalCents: cart.totalCents,
      text: formatCart(lines, cart.totalCents),
    };
  }

  presentAdded(result: AddItemToCartResult): AddItemView {
    if (!result.ok) {
      return { ok: false, message: messageFor(result.error) };
    }
    const item = toLineView(result.item);
    return {
      ok: true,
      message: `Added ${item.name} (${item.id}). Quantity is now ${item.quantity}.`,
      item,
      cart: this.presentCart(result.cart),
    };
  }

  presentRemoved(result: RemoveItemFromCartResult): RemoveItemView {
    if (!result.ok) {
      return { ok: false, message: messageFor(result.error) };
    }
    const removed = toLineView(result.removed);
    return {
      ok: true,
      message: `Removed ${removed.name} (${removed.id}).`,
      removed,
      cart: this.presentCart(result.cart),
    };
  }
}

function toLineView(line: CartLine): CartLineView {
  return {
    id: line.id,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    quantity: line.quantity,
    lineTotalCents: line.lineTotalCents,
    text: formatLine(line),
  };
}

function formatLine(line: CartLine): string {
  const price = formatCents(line.unitPriceCents);
  const total = formatCents(line.lineTotalCents);
  return `${line.name} (${line.id}) x${line.quantity} @ ${price} = ${total}`;
}

function formatCart(lines: readonly CartLineView[], totalCents: number): string {
  const body =
    lines.length === 0
      ? "The shopping cart is empty."
      : lines.map((line) => line.text).join("\n");
  return `${body}\nTotal: ${formatCents(totalCents)}`;
}

function formatCents(cents: number): string {
  const negative = cents < 0;
  const absolute = negative ? -cents : cents;
  const dollars = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  const fraction = remainder < 10 ? `0${remainder}` : `${remainder}`;
  return `${negative ? "-" : ""}$${dollars}.${fraction}`;
}

function messageFor(error: CartError): string {
  switch (error.code) {
    case "empty-id":
      return "Item id is required.";
    case "empty-name":
      return "Item name is required.";
    case "invalid-price":
      return "Unit price must be a whole number of cents, zero or greater.";
    case "invalid-quantity":
      return "Quantity must be a whole number greater than zero.";
    case "line-total-overflow":
      return "Line total is too large.";
    case "cart-total-overflow":
      return "Cart total is too large.";
    case "item-conflict":
      return `Item ${error.itemId} is already in the cart with a different name or price.`;
    case "item-not-found":
      return `Item ${error.itemId} is not in the cart.`;
    default: {
      const unreachable: never = error;
      return unreachable;
    }
  }
}
