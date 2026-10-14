import { createShoppingCartProgram, type ShoppingCartProgram } from "./program/shopping-cart-program";
import {
  formatAddRejected,
  formatEventLog,
  formatItemAdded,
  formatItemRemoved,
  formatRemoveRejected,
  formatShownCart,
} from "./presentation/text-cart-view";

export function runShoppingCart(program: ShoppingCartProgram = createShoppingCartProgram()): string {
  const parts: string[] = [];

  program.subscribe("ItemAddedToCart", (envelope) => {
    parts.push(formatItemAdded(envelope.event));
  });
  program.subscribe("ItemRemovedFromCart", (envelope) => {
    parts.push(formatItemRemoved(envelope.event));
  });
  program.subscribe("AddItemRejected", (envelope) => {
    parts.push(formatAddRejected(envelope.event));
  });
  program.subscribe("RemoveItemRejected", (envelope) => {
    parts.push(formatRemoveRejected(envelope.event));
  });
  program.subscribe("CartShown", (envelope) => {
    parts.push(formatShownCart(envelope.event.cart));
  });

  parts.push("Show the shopping cart before adding an item:");
  program.request({ type: "ShowCartRequested" });

  parts.push("", "Add milk:");
  program.request({
    type: "AddItemRequested",
    itemId: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 1,
  });

  parts.push("", "Add the same milk again:");
  program.request({
    type: "AddItemRequested",
    itemId: "milk",
    name: "Milk",
    unitPriceCents: 199,
    quantity: 1,
  });

  parts.push("", "Add milk at a different price:");
  program.request({
    type: "AddItemRequested",
    itemId: "milk",
    name: "Milk",
    unitPriceCents: 250,
    quantity: 1,
  });

  parts.push("", "Add bread:");
  program.request({
    type: "AddItemRequested",
    itemId: "bread",
    name: "Bread",
    unitPriceCents: 250,
    quantity: 1,
  });

  parts.push("", "Add eggs with quantity 0:");
  program.request({
    type: "AddItemRequested",
    itemId: "eggs",
    name: "Eggs",
    unitPriceCents: 349,
    quantity: 0,
  });

  parts.push("", "Show the shopping cart:");
  program.request({ type: "ShowCartRequested" });

  parts.push("", "Remove one milk:");
  program.request({ type: "RemoveItemRequested", itemId: "milk", quantity: 1 });

  parts.push("", "Remove bread:");
  program.request({ type: "RemoveItemRequested", itemId: "bread", quantity: 1 });

  parts.push("", "Remove five milk:");
  program.request({ type: "RemoveItemRequested", itemId: "milk", quantity: 5 });

  parts.push("", "Remove bread again:");
  program.request({ type: "RemoveItemRequested", itemId: "bread", quantity: 1 });

  parts.push("", "Show the shopping cart after removal:");
  program.request({ type: "ShowCartRequested" });

  parts.push("", formatEventLog(program.readEvents()));
  return `${parts.join("\n").trimEnd()}\n`;
}

export const demo = runShoppingCart();
