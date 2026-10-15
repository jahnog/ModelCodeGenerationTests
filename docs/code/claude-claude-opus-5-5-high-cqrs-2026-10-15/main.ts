import { EventBus } from "./infrastructure/eventBus";
import { CartProjection } from "./read/cartProjection";
import { CartQueryHandler } from "./read/cartQueryHandler";
import type { CartView } from "./read/cartView";
import { CartCommandHandler } from "./write/cartCommandHandler";
import { CartRepository } from "./write/cartRepository";
import type { CommandResult } from "./write/commands";

type Print = (line: string) => void;

// Reaches console through globalThis so the file typechecks with or without the DOM lib.
const host = globalThis as unknown as { console?: { log(line: string): void } };
const print: Print = (line) => host.console?.log(line);

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function renderCart(view: CartView): string {
  if (view.items.length === 0) {
    return `Cart ${view.cartId} is empty.`;
  }
  const lines = view.items.map(
    (item) =>
      `  ${item.quantity} x ${item.name} (${item.productId}) @ ${formatCents(item.unitPriceCents)} = ${formatCents(item.lineTotalCents)}`,
  );
  return [
    `Cart ${view.cartId}:`,
    ...lines,
    `  Items: ${view.totalQuantity}  Total: ${formatCents(view.totalCents)}`,
  ].join("\n");
}

function report(action: string, result: CommandResult): void {
  print(result.ok ? `${action}: done` : `${action}: rejected - ${result.error}`);
}

export function main(): void {
  const eventBus = new EventBus();

  const projection = new CartProjection();
  eventBus.subscribe(projection.handle);
  const queries = new CartQueryHandler(projection);

  const commands = new CartCommandHandler(new CartRepository(), eventBus);

  const cartId = "cart-1";
  const showCart = (): void => print(renderCart(queries.handle({ type: "GetCart", cartId })));

  showCart();

  report("Add 2 apples", commands.handle({
    type: "AddItem", cartId, productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 2,
  }));
  report("Add 1 bread", commands.handle({
    type: "AddItem", cartId, productId: "bread", name: "Bread", unitPriceCents: 325, quantity: 1,
  }));
  report("Add 3 more apples", commands.handle({
    type: "AddItem", cartId, productId: "apple", name: "Apple", unitPriceCents: 50, quantity: 3,
  }));
  showCart();

  report("Remove bread", commands.handle({ type: "RemoveItem", cartId, productId: "bread" }));
  showCart();

  report("Remove milk", commands.handle({ type: "RemoveItem", cartId, productId: "milk" }));
  report("Add 0 bananas", commands.handle({
    type: "AddItem", cartId, productId: "banana", name: "Banana", unitPriceCents: 25, quantity: 0,
  }));
  showCart();
}

main();
