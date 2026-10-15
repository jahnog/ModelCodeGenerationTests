import { ShoppingCart } from "./shopping-cart";
import type { CartItem } from "./shopping-cart";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(action: () => void, errorType: typeof Error): void {
  try {
    action();
  } catch (error) {
    assert(error instanceof errorType, `Expected ${errorType.name}.`);
    return;
  }

  throw new Error(`Expected ${errorType.name} to be thrown.`);
}

const cart = new ShoppingCart();
const notebook: CartItem = { id: "book", name: "Notebook", price: 4.5 };
const pen: CartItem = { id: "pen", name: "Pen", price: 1.25 };

assert(cart.getItems().length === 0, "A new cart must be empty.");

cart.addItem(notebook);
cart.addItem(pen);

const items = cart.getItems();
assert(items.length === 2, "Both items must be listed.");
assert(items[0]?.id === notebook.id, "Items must retain insertion order.");
assert(items[0]?.name === notebook.name, "Item names must be retained.");
assert(items[0]?.price === notebook.price, "Item prices must be retained.");
assert(items[1]?.id === pen.id, "The second item must be listed.");

assertThrows(() => cart.addItem(notebook), Error);
assert(cart.getItems().length === 2, "Duplicate IDs must not replace items.");

const invalidItems: readonly CartItem[] = [
  { ...notebook, id: "" },
  { ...notebook, id: "   " },
  { ...notebook, name: "" },
  { ...notebook, name: "   " },
  { ...notebook, price: -1 },
  { ...notebook, price: NaN },
  { ...notebook, price: Infinity },
  { ...notebook, price: -Infinity },
];

for (const item of invalidItems) {
  assertThrows(
    () => cart.addItem(item),
    item.price < 0 || !Number.isFinite(item.price) ? RangeError : TypeError,
  );
}

assert(cart.getItems().length === 2, "Invalid items must not change the cart.");
assertThrows(() => cart.removeItem(" "), TypeError);

assert(cart.removeItem(notebook.id), "Removing an existing item must succeed.");
assert(cart.getItems().length === 1, "Only the removed item must disappear.");
assert(cart.getItems()[0]?.id === pen.id, "Other items must remain in the cart.");
assert(!cart.removeItem("missing"), "Removing a missing item must return false.");
assert(cart.removeItem(pen.id), "The last item must be removable.");
assert(cart.getItems().length === 0, "Removing all items must leave an empty cart.");

const mutableItem = { id: "gift", name: "Gift", price: 0 };
cart.addItem(mutableItem);
mutableItem.name = "Changed";
mutableItem.price = 10;
assert(cart.getItems()[0]?.name === "Gift", "Added items must be copied.");
assert(cart.getItems()[0]?.price === 0, "Free items must be accepted and copied.");

const snapshot = cart.getItems();
assert(snapshot !== cart.getItems(), "Each listing must be a new array.");
assert(snapshot[0] !== cart.getItems()[0], "Listed items must be copied.");
cart.removeItem("gift");
assert(snapshot.length === 1, "Existing snapshots must not change with the cart.");

console.log("All shopping cart tests passed.");

export {};
