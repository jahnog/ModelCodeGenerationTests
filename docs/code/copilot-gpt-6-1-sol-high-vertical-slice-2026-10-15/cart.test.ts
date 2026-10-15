import { addItem, createCart, removeItem, showItems } from "./index";
import type { AddItemCommand } from "./index";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(action: () => void, message: string): void {
  let threw = false;
  try {
    action();
  } catch (error: unknown) {
    if (!(error instanceof Error)) {
      throw error;
    }
    threw = true;
  }
  assert(threw, message);
}

export function runCartTests(): void {
  const book: AddItemCommand = {
    id: "book",
    name: "TypeScript Handbook",
    unitPriceCents: 2500,
  };
  const empty = createCart();
  assert(showItems(empty).length === 0, "A new cart must be empty.");

  const added = addItem(empty, book);
  const firstItem = showItems(added)[0];
  assert(firstItem !== undefined, "Adding must create an item.");
  assert(firstItem.id === "book", "Adding must preserve the item ID.");
  assert(firstItem.name === book.name, "Adding must preserve the item name.");
  assert(firstItem.unitPriceCents === 2500, "Prices must remain in cents.");
  assert(firstItem.quantity === 1, "Quantity must default to one.");
  assert(showItems(empty).length === 0, "Adding must not mutate the old cart.");

  const combined = addItem(added, { ...book, quantity: 2 });
  assert(showItems(combined).length === 1, "Duplicate IDs must merge.");
  assert(showItems(combined)[0]?.quantity === 3, "Quantities must add up.");
  assert(showItems(added)[0]?.quantity === 1, "Merging must not mutate old carts.");

  const multiple = addItem(combined, {
    id: "pen",
    name: "Blue Pen",
    unitPriceCents: 150,
    quantity: 2,
  });
  assert(
    showItems(multiple).map((item) => item.id).join(",") === "book,pen",
    "Items must be shown in insertion order.",
  );
  const snapshot = showItems(multiple);
  assert(snapshot !== multiple.items, "Showing items must copy the array.");
  assert(snapshot[0] !== multiple.items[0], "Showing items must copy each item.");

  const removed = removeItem(multiple, "book");
  assert(showItems(removed).length === 1, "Removing must delete the whole item.");
  assert(showItems(removed)[0]?.id === "pen", "Other items must remain.");
  assert(showItems(multiple).length === 2, "Removing must not mutate old carts.");
  assert(
    showItems(removeItem(removed, "pen")).length === 0,
    "Removing the last item must leave an empty cart.",
  );
  assertThrows(() => removeItem(empty, "book"), "Missing items must be rejected.");
  assertThrows(() => removeItem(added, " "), "Blank removal IDs must be rejected.");
  assertThrows(() => addItem(empty, { ...book, id: " " }), "Reject blank IDs.");
  assertThrows(() => addItem(empty, { ...book, name: " " }), "Reject blank names.");

  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assertThrows(
      () => addItem(empty, { ...book, quantity }),
      `Reject invalid quantity: ${quantity}.`,
    );
  }
  for (const unitPriceCents of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assertThrows(
      () => addItem(empty, { ...book, unitPriceCents }),
      `Reject invalid price: ${unitPriceCents}.`,
    );
  }
  assert(
    showItems(addItem(empty, { ...book, unitPriceCents: 0 }))[0]?.unitPriceCents === 0,
    "Free items must be allowed.",
  );
  assertThrows(
    () => addItem(added, { ...book, name: "Different book" }),
    "Duplicate IDs with different names must be rejected.",
  );
  assertThrows(
    () => addItem(added, { ...book, unitPriceCents: 3000 }),
    "Duplicate IDs with different prices must be rejected.",
  );
  const full = addItem(empty, { ...book, quantity: Number.MAX_SAFE_INTEGER });
  assertThrows(() => addItem(full, book), "Combined quantity overflow must fail.");
}
