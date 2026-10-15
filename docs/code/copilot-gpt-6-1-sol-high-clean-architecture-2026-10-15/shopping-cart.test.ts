import type { CartRepository } from "./cart-repository";
import {
  AddItemToCart,
  ListCartItems,
  RemoveItemFromCart,
} from "./cart-use-cases";
import { InMemoryCartRepository } from "./in-memory-cart-repository";
import { createShoppingCart } from "./index";
import { ShoppingCart } from "./shopping-cart";
import type { AddItemInput } from "./shopping-cart";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function expectError(action: () => void, message: string): void {
  try {
    action();
  } catch (error: unknown) {
    assert(error instanceof Error, "Expected an Error instance.");
    assert(error.message.includes(message), `Unexpected error: ${error.message}`);
    return;
  }
  throw new Error(`Expected an error containing "${message}".`);
}

const notebook: AddItemInput = {
  id: "notebook",
  name: "Notebook",
  unitPriceInCents: 500,
};

export function runShoppingCartTests(): void {
  const cart = new ShoppingCart();
  assert(cart.listItems().length === 0, "A new cart must be empty.");

  cart.addItem(notebook);
  cart.addItem({ ...notebook, quantity: 2 });
  let items = cart.listItems();
  assert(items.length === 1, "Repeated IDs must not create duplicate lines.");
  assert(items[0]?.quantity === 3, "Repeated additions must combine quantities.");

  cart.addItem({ id: " pen ", name: " Pen ", unitPriceInCents: 150 });
  items = cart.listItems();
  assert(items[1]?.id === "pen", "IDs must be normalized.");
  assert(items[1]?.name === "Pen", "Names must be normalized.");
  cart.removeItem(" notebook ");
  assert(cart.listItems().length === 1, "Removal must delete the entire line.");
  assert(cart.listItems()[0]?.id === "pen", "Removal must preserve other items.");

  expectError(() => cart.removeItem("missing"), "not in the shopping cart");
  expectError(() => cart.removeItem(" "), "must not be empty");

  for (const id of ["", " "]) {
    expectError(() => cart.addItem({ ...notebook, id }), "nonempty ID and name");
  }
  expectError(
    () => cart.addItem({ ...notebook, name: " " }),
    "nonempty ID and name",
  );
  for (const unitPriceInCents of [-1, 0.5, NaN, Infinity, 2 ** 53]) {
    expectError(
      () => cart.addItem({ ...notebook, unitPriceInCents }),
      "unit price",
    );
  }
  for (const quantity of [0, -1, 0.5, NaN, Infinity, 2 ** 53]) {
    expectError(() => cart.addItem({ ...notebook, quantity }), "quantity");
  }
  assert(cart.listItems().length === 1, "Invalid additions must not alter the cart.");

  cart.addItem(notebook);
  expectError(
    () => cart.addItem({ ...notebook, name: "Different notebook" }),
    "same name and unit price",
  );
  expectError(
    () => cart.addItem({ ...notebook, unitPriceInCents: 501 }),
    "same name and unit price",
  );
  assert(cart.listItems()[1]?.quantity === 1, "Conflicting additions must be atomic.");

  const largeCart = new ShoppingCart();
  largeCart.addItem({ ...notebook, quantity: Number.MAX_SAFE_INTEGER });
  expectError(() => largeCart.addItem(notebook), "safe integer limit");
  assert(
    largeCart.listItems()[0]?.quantity === Number.MAX_SAFE_INTEGER,
    "Overflow must not change the quantity.",
  );
  largeCart.addItem({ id: "gift", name: "Gift", unitPriceInCents: 0 });
  assert(largeCart.listItems().length === 2, "Free items must be accepted.");

  const externalItem = { ...notebook };
  const isolatedCart = new ShoppingCart();
  isolatedCart.addItem(externalItem);
  externalItem.name = "Changed externally";
  assert(isolatedCart.listItems()[0]?.name === "Notebook", "Inputs must be copied.");
  const snapshot = isolatedCart.listItems();
  const snapshotItem = snapshot[0];
  assert(snapshotItem !== undefined, "Expected a snapshot item.");
  Object.assign(snapshotItem, { name: "Changed snapshot" });
  assert(isolatedCart.listItems()[0]?.name === "Notebook", "Outputs must be copied.");

  const repository = new InMemoryCartRepository();
  repository.save(isolatedCart);
  isolatedCart.removeItem("notebook");
  assert(repository.load().listItems().length === 1, "Saved carts must be copied.");
  const loadedCart = repository.load();
  loadedCart.removeItem("notebook");
  assert(repository.load().listItems().length === 1, "Loaded carts must be copied.");

  const add = new AddItemToCart(repository);
  const list = new ListCartItems(repository);
  const remove = new RemoveItemFromCart(repository);
  add.execute({ ...notebook, quantity: 2 });
  assert(list.execute()[0]?.quantity === 3, "Use cases must share persisted state.");
  remove.execute("notebook");
  assert(list.execute().length === 0, "The removal use case must persist changes.");

  let saves = 0;
  const countedRepository: CartRepository = {
    load: () => new ShoppingCart(),
    save: () => {
      saves += 1;
    },
  };
  new ListCartItems(countedRepository).execute();
  expectError(
    () => new AddItemToCart(countedRepository).execute({ ...notebook, quantity: 0 }),
    "quantity",
  );
  expectError(
    () => new RemoveItemFromCart(countedRepository).execute("missing"),
    "not in the shopping cart",
  );
  assert(saves === 0, "Queries and invalid commands must not save.");

  const application = createShoppingCart();
  assert(application.showItems() === "Shopping cart is empty.", "Empty presentation.");
  application.addItem(notebook);
  assert(
    application.showItems() === "Shopping cart:\nNotebook [notebook]: 1 x 500 cents",
    "The presentation must show the item's name, ID, quantity, and price.",
  );
  assert(
    createShoppingCart().showItems() === "Shopping cart is empty.",
    "Application instances must have independent storage.",
  );
  application.removeItem("notebook");
  assert(application.showItems() === "Shopping cart is empty.", "Empty after removal.");
}
