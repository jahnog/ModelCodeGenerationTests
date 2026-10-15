import type { CartItem } from "./cart-item";
import { CartPresenter } from "./cart-presenter";
import { InMemoryCartStore } from "./cart-store";
import { ShoppingCart } from "./shopping-cart";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectError(action: () => void, expectedMessage: string): void {
  try {
    action();
  } catch (error: unknown) {
    assert(error instanceof Error, "Expected an Error instance.");
    assert(error.message === expectedMessage, `Unexpected error: ${error.message}`);
    return;
  }
  throw new Error(`Expected error: ${expectedMessage}`);
}

export function runTests(): void {
  const store = new InMemoryCartStore();
  const cart = new ShoppingCart(store);
  const output: string[] = [];
  const presenter = new CartPresenter(cart, (message) => output.push(message));
  const book = {
    id: "book",
    name: "Book",
    unitPriceCents: 2500,
    quantity: 1,
  };

  assert(cart.getItems().length === 0, "A new cart must be empty.");
  presenter.showItems();
  assert(output.pop() === "The shopping cart is empty.", "Show an empty cart.");

  cart.addItem(book);
  book.name = "Changed outside the cart";
  assert(cart.getItems()[0]?.name === "Book", "Copy items when storing them.");
  book.name = "Book";
  cart.addItem({ ...book, quantity: 2 });
  assert(cart.getItems().length === 1, "Merge repeated product IDs.");
  assert(cart.getItems()[0]?.quantity === 3, "Accumulate quantities.");

  const snapshot = cart.getItems();
  cart.addItem({ id: "pen", name: "Pen", unitPriceCents: 0, quantity: 1 });
  assert(snapshot.length === 1, "Listing must return an independent snapshot.");
  const retrieved = store.findById("book");
  assert(retrieved !== undefined, "Find a stored item.");
  store.save({ ...retrieved, quantity: 4 });
  assert(snapshot[0]?.quantity === 3, "Snapshots must not track stored changes.");
  assert(store.findById("missing") === undefined, "Missing lookups are undefined.");

  presenter.showItems();
  assert(output.length === 3, "Show a header and both items.");
  assert(
    output[1] === "book: Book | quantity: 4 | unit price: 2500",
    "Show item ID, name, quantity, and price.",
  );
  assert(
    output[2] === "pen: Pen | quantity: 1 | unit price: 0",
    "Show free items.",
  );

  const invalidItems: readonly [CartItem, string][] = [
    [{ ...book, id: " " }, "Item ID must not be blank."],
    [{ ...book, name: "\t" }, "Item name must not be blank."],
    ...[-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map(
      (unitPriceCents): [CartItem, string] => [
        { ...book, unitPriceCents },
        "Unit price must be a non-negative safe integer in cents.",
      ],
    ),
    ...[0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map(
      (quantity): [CartItem, string] => [
        { ...book, quantity },
        "Quantity must be a positive safe integer.",
      ],
    ),
  ];
  for (const [item, message] of invalidItems) {
    expectError(() => cart.addItem(item), message);
  }
  for (const item of [
    { ...book, name: "Different book" },
    { ...book, unitPriceCents: 1 },
  ]) {
    expectError(
      () => cart.addItem(item),
      'Item "book" already exists with different details.',
    );
  }
  expectError(
    () => cart.addItem({ ...book, quantity: Number.MAX_SAFE_INTEGER }),
    "Combined quantity exceeds the safe integer limit.",
  );
  assert(cart.getItems()[0]?.quantity === 4, "Failed additions preserve state.");
  assert(cart.getItems().length === 2, "Invalid items must not be stored.");

  expectError(() => cart.removeItem(" "), "Item ID must not be blank.");
  expectError(
    () => cart.removeItem("missing"),
    'Item "missing" is not in the cart.',
  );
  cart.removeItem("book");
  assert(cart.getItems()[0]?.id === "pen", "Remove only the selected item.");
  expectError(
    () => cart.removeItem("book"),
    'Item "book" is not in the cart.',
  );
  cart.removeItem("pen");
  assert(cart.getItems().length === 0, "Remove the final item.");
  presenter.showItems();
  assert(output.pop() === "The shopping cart is empty.", "Show the emptied cart.");

  const otherCart = new ShoppingCart(new InMemoryCartStore());
  otherCart.addItem(book);
  assert(cart.getItems().length === 0, "Separate stores isolate carts.");
}

runTests();
