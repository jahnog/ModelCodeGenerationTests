import { CartItem } from "./cart-item";
import { InMemoryShoppingCartRepository } from "./in-memory-shopping-cart-repository";
import { ShoppingCart } from "./shopping-cart";
import { ShoppingCartService } from "./shopping-cart-service";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectError(action: () => void, message: string): void {
  try {
    action();
  } catch (error: unknown) {
    if (!(error instanceof Error) || !error.message.includes(message)) {
      throw error;
    }
    return;
  }
  throw new Error(`Expected an error containing "${message}".`);
}

export function runShoppingCartTests(): void {
  const repository = new InMemoryShoppingCartRepository();
  const service = new ShoppingCartService(repository);
  const book = { productId: "book", name: "Book" };
  service.createCart("cart");
  service.createCart("other");
  assert(service.listItems("cart").length === 0, "New carts must be empty.");

  service.addItem("cart", book);
  service.addItem("cart", { ...book, quantity: 2 });
  service.addItem("cart", { productId: "pen", name: "Pen" });
  const items = service.listItems("cart");
  assert(items.length === 2, "Repeated products must use one cart line.");
  assert(items[0]?.productId === "book", "Items must retain insertion order.");
  assert(items[0]?.quantity === 3, "Repeated additions must combine quantities.");
  assert(items[1]?.quantity === 1, "Quantity must default to one.");
  assert(service.listItems("other").length === 0, "Carts must be independent.");

  service.removeItem("cart", "book");
  const remaining = service.listItems("cart");
  assert(remaining.length === 1, "Removal must delete the whole cart line.");
  assert(remaining[0]?.productId === "pen", "Removal must preserve other items.");
  assert(items.length === 2, "Previously listed items must be snapshots.");
  service.removeItem("cart", "pen");
  assert(service.listItems("cart").length === 0, "Removing all items must work.");

  expectError(() => service.createCart("cart"), "already exists");
  expectError(() => service.listItems("missing"), "was not found");
  expectError(() => service.addItem("missing", book), "was not found");
  expectError(() => service.removeItem("missing", "book"), "was not found");
  expectError(() => service.removeItem("cart", "missing"), "is not in cart");
  expectError(() => new ShoppingCart(" "), "Cart ID");
  expectError(() => new CartItem(" ", "Book"), "Product ID");
  expectError(() => new CartItem("book", " "), "Item name");

  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    expectError(() => service.addItem("cart", { ...book, quantity }), "Quantity");
  }
  assert(service.listItems("cart").length === 0, "Invalid adds must not persist.");

  service.addItem("cart", { ...book, quantity: Number.MAX_SAFE_INTEGER });
  expectError(() => service.addItem("cart", book), "Quantity");
  expectError(
    () => service.addItem("cart", { ...book, name: "Different book" }),
    "different name",
  );
  assert(
    service.listItems("cart")[0]?.quantity === Number.MAX_SAFE_INTEGER,
    "Rejected changes must leave the cart unchanged.",
  );

  const loaded = repository.findById("cart");
  assert(loaded !== undefined, "Saved carts must be retrievable.");
  loaded.removeItem("book");
  assert(
    service.listItems("cart").length === 1,
    "Repository reads must not expose stored mutable aggregates.",
  );
  repository.save(loaded);
  loaded.addItem(new CartItem("pen", "Pen"));
  assert(
    service.listItems("cart").length === 0,
    "Repository saves must not retain mutable aggregate references.",
  );

  const cart = new ShoppingCart("snapshot", [new CartItem("book", " Book ")]);
  const snapshot = cart.items;
  assert(snapshot[0]?.name === "Book", "Item names must be trimmed.");
  assert(Object.isFrozen(snapshot[0]), "Listed items must be immutable.");
  cart.addItem(new CartItem("book", "Book"));
  assert(snapshot[0]?.quantity === 1, "Adding must not mutate previous items.");
  assert(cart.items[0]?.quantity === 2, "The aggregate must retain the update.");
  console.log("Shopping cart tests passed.");
}

runShoppingCartTests();
