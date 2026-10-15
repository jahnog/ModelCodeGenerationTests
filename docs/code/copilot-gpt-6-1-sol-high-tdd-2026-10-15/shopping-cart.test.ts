import { ShoppingCart, type CartItem } from "./shopping-cart";

export {};

// Run without installing dependencies (Node.js 24+):
// sed 's|"./shopping-cart"|"./shopping-cart.ts"|' shopping-cart.test.ts | node --input-type=module-typescript
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertItems(actual: CartItem[], expected: CartItem[]): void {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );
}

function assertThrows(action: () => void, expectedMessage: string): void {
  try {
    action();
  } catch (error) {
    assert(error instanceof Error, "Expected an Error");
    assert(
      error.message === expectedMessage,
      `Expected "${expectedMessage}", received "${error.message}"`,
    );
    return;
  }
  throw new Error(`Expected "${expectedMessage}" to be thrown`);
}

function test(name: string, action: () => void): void {
  try {
    action();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`, error);
  }
}

const apple: CartItem = { id: "apple", name: "Apple", price: 1.25 };
const bread: CartItem = { id: "bread", name: "Bread", price: 2.5 };

test("a new cart is empty", () => {
  const cart = new ShoppingCart();
  assertItems(cart.getItems(), []);
  assert(cart.showItems() === "Shopping cart is empty.", "Show an empty-cart message");
});

test("adds an item with its ID, name, and price", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  assertItems(cart.getItems(), [apple]);
});

test("keeps items in insertion order", () => {
  const cart = new ShoppingCart();
  cart.addItem(bread);
  cart.addItem(apple);
  assertItems(cart.getItems(), [bread, apple]);
});

test("shows each item's ID, name, and price with two decimal places", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  cart.addItem(bread);
  assert(
    cart.showItems() === "apple: Apple - 1.25\nbread: Bread - 2.50",
    "Show one readable line per item",
  );
  assertItems(cart.getItems(), [apple, bread]);
});

test("removes only the item with the matching ID", () => {
  const cart = new ShoppingCart();
  const otherApple: CartItem = { id: "other-apple", name: "Apple", price: 2 };
  cart.addItem(apple);
  cart.addItem(bread);
  cart.addItem(otherApple);
  assert(cart.removeItem("bread"), "Report successful removal");
  assertItems(cart.getItems(), [apple, otherApple]);
  assert(cart.removeItem("apple"), "Remove by ID, not by name");
  assertItems(cart.getItems(), [otherApple]);
});

test("removing the last item restores the empty-cart display", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  assert(cart.removeItem("apple"), "Remove the final item");
  assertItems(cart.getItems(), []);
  assert(cart.showItems() === "Shopping cart is empty.", "Show the empty state");
});

test("an unknown ID leaves a populated cart unchanged", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  assert(!cart.removeItem("missing"), "Report that no item was removed");
  assertItems(cart.getItems(), [apple]);
});

test("removing from an empty cart reports no removal", () => {
  assert(!new ShoppingCart().removeItem("missing"), "Do not report a removal");
});

test("rejects duplicate IDs without changing the existing item", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  assertThrows(
    () => cart.addItem({ id: "apple", name: "Replacement", price: 99 }),
    'Item with ID "apple" is already in the cart.',
  );
  assertItems(cart.getItems(), [apple]);
});

test("a removed ID can be added again", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  cart.removeItem("apple");
  cart.addItem(bread);
  cart.addItem(apple);
  assertItems(cart.getItems(), [bread, apple]);
});

for (const id of ["", "   "]) {
  test(`rejects blank ID ${JSON.stringify(id)} without changing the cart`, () => {
    const cart = new ShoppingCart();
    cart.addItem(bread);
    assertThrows(() => cart.addItem({ ...apple, id }), "Item ID must not be blank.");
    assertItems(cart.getItems(), [bread]);
  });
}

for (const name of ["", " \t "]) {
  test(`rejects blank name ${JSON.stringify(name)} without changing the cart`, () => {
    const cart = new ShoppingCart();
    cart.addItem(bread);
    assertThrows(
      () => cart.addItem({ ...apple, name }),
      "Item name must not be blank.",
    );
    assertItems(cart.getItems(), [bread]);
  });
}

for (const price of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
  test(`rejects invalid price ${String(price)} without changing the cart`, () => {
    const cart = new ShoppingCart();
    cart.addItem(bread);
    assertThrows(
      () => cart.addItem({ ...apple, price }),
      "Item price must be a finite, non-negative number.",
    );
    assertItems(cart.getItems(), [bread]);
  });
}

test("accepts a free item", () => {
  const cart = new ShoppingCart();
  cart.addItem({ id: "sample", name: "Sample", price: 0 });
  assert(cart.showItems() === "sample: Sample - 0.00", "Show a zero price");
});

test("changing the original item does not change the cart", () => {
  const cart = new ShoppingCart();
  const item = { ...apple };
  cart.addItem(item);
  item.id = "changed";
  item.name = "Changed";
  item.price = 99;
  assertItems(cart.getItems(), [apple]);
  assert(cart.removeItem("apple"), "Keep the original ID");
});

test("changing a returned snapshot does not change the cart", () => {
  const cart = new ShoppingCart();
  cart.addItem(apple);
  const snapshot = cart.getItems();
  const item = snapshot[0];
  assert(item !== undefined, "The snapshot contains the item");
  item.id = "changed";
  item.name = "Changed";
  item.price = 99;
  snapshot.push(bread);
  snapshot.splice(0, 1);
  assertItems(cart.getItems(), [apple]);
  cart.addItem(bread);
  assertItems(snapshot, [bread]);
});

test("separate carts do not share items", () => {
  const first = new ShoppingCart();
  const second = new ShoppingCart();
  first.addItem(apple);
  second.addItem(bread);
  first.removeItem("apple");
  assertItems(first.getItems(), []);
  assertItems(second.getItems(), [bread]);
});

console.log(`\n${passed} passed, ${failed} failed.`);
if (failed > 0) {
  throw new Error(`${failed} shopping cart test(s) failed.`);
}
