import { EventBus } from "./event-bus";
import {
  ShoppingCart,
  type CartEvents,
  type CartItem,
  type CartSnapshot,
} from "./shopping-cart";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(action: () => void, message: string): void {
  try {
    action();
  } catch (error: unknown) {
    assert(error instanceof Error, "Failures must be explicit errors.");
    assert(error.message.includes(message), `Unexpected error: ${error.message}`);
    return;
  }
  throw new Error(`Expected an error containing "${message}".`);
}

function showItems(events: EventBus<CartEvents>): CartSnapshot {
  const results: CartSnapshot[] = [];
  const unsubscribe = events.on("cart:items-shown", (cart) => results.push(cart));
  try {
    events.emit("cart:show-items", undefined);
  } finally {
    unsubscribe();
  }
  const result = results[0];
  assert(result !== undefined, "Showing the cart must publish its contents.");
  return result;
}

export function runTests(): void {
  const events = new EventBus<CartEvents>();
  const cart = new ShoppingCart(events);
  const item: CartItem = {
    id: "apple",
    name: "Apple",
    unitPriceCents: 150,
    quantity: 2,
  };
  const added: CartItem[] = [];
  const removed: CartItem[] = [];
  events.on("cart:item-added", (entry) => added.push(entry));
  events.on("cart:item-removed", (entry) => removed.push(entry));

  assert(showItems(events).items.length === 0, "A new cart must be empty.");
  events.emit("cart:add-item", item);
  const first = showItems(events);
  assert(first.items.length === 1, "The added item must be listed.");
  assert(first.totalQuantity === 2 && first.totalCents === 300, "Incorrect totals.");
  assert(added.length === 1 && added[0]?.id === item.id, "Missing added event.");
  assert(Object.isFrozen(first.items[0]), "Published items must be immutable.");
  assert(Object.isFrozen(first.items), "Published lists must be immutable.");

  events.emit("cart:add-item", { ...item, quantity: 1 });
  events.emit("cart:add-item", {
    id: "bread",
    name: "Bread",
    unitPriceCents: 325,
    quantity: 1,
  });
  const combined = showItems(events);
  assert(combined.items.length === 2, "Repeated IDs must merge, not duplicate.");
  assert(combined.totalQuantity === 4 && combined.totalCents === 775, "Incorrect merged totals.");
  assert(first.totalCents === 300, "Earlier snapshots must not change.");

  assertThrows(() => events.emit("cart:add-item", { ...item, id: " " }), "non-empty");
  assertThrows(() => events.emit("cart:add-item", { ...item, name: " " }), "non-empty");
  for (const quantity of [0, -1, 1.5, NaN, Infinity]) {
    assertThrows(() => events.emit("cart:add-item", { ...item, quantity }), "quantity");
  }
  for (const unitPriceCents of [-1, 1.5, NaN, Infinity]) {
    assertThrows(
      () => events.emit("cart:add-item", { ...item, unitPriceCents }),
      "unit price",
    );
  }
  assertThrows(
    () => events.emit("cart:add-item", { ...item, unitPriceCents: 151 }),
    "different details",
  );
  assertThrows(
    () => events.emit("cart:add-item", { ...item, name: "Different apple" }),
    "different details",
  );
  assertThrows(
    () => events.emit("cart:add-item", {
      id: "expensive",
      name: "Expensive",
      unitPriceCents: Number.MAX_SAFE_INTEGER,
      quantity: 2,
    }),
    "safe integer limits",
  );
  assert(showItems(events).totalCents === 775, "Rejected commands must not change state.");

  assertThrows(() => events.emit("cart:remove-item", { id: "missing" }), "not in");
  events.emit("cart:remove-item", { id: "apple" });
  const remaining = showItems(events);
  assert(remaining.items.length === 1 && remaining.items[0]?.id === "bread", "Remove must delete the entire entry.");
  assert(remaining.totalQuantity === 1 && remaining.totalCents === 325, "Remove must update totals.");
  assert(removed.length === 1 && removed[0]?.quantity === 3, "Missing removed event.");
  events.emit("cart:remove-item", { id: "bread" });
  assert(showItems(events).totalCents === 0, "Removing all items must empty the cart.");

  events.emit("cart:add-item", { ...item, unitPriceCents: 0, quantity: Number.MAX_SAFE_INTEGER });
  assertThrows(() => events.emit("cart:add-item", { ...item, unitPriceCents: 0, quantity: 1 }), "safe integer limits");
  events.emit("cart:remove-item", { id: "apple" });

  const calls: number[] = [];
  const stop = events.on("cart:show-items", () => calls.push(1));
  events.emit("cart:show-items", undefined);
  stop();
  stop();
  events.emit("cart:show-items", undefined);
  assert(calls.length === 1, "Unsubscribed handlers must stop receiving events.");

  cart.dispose();
  cart.dispose();
  let wasShown = false;
  events.on("cart:items-shown", () => { wasShown = true; });
  events.emit("cart:show-items", undefined);
  assert(!wasShown, "Disposed carts must stop handling commands.");
  console.log("All shopping cart tests passed.");
}

runTests();
