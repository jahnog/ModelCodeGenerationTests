import { ShoppingCart } from "./cart";
import { assertEqual, assertThrows, test, type TestCase } from "./testing";

const apple = { id: "apple", name: "Apple", priceCents: 50 };
const bread = { id: "bread", name: "Bread", priceCents: 250 };

export const cartTests: readonly TestCase[] = [
  test("a new cart is empty", () => {
    const cart = new ShoppingCart();
    assertEqual(cart.getItems(), []);
    assertEqual(cart.isEmpty(), true);
    assertEqual(cart.totalCents(), 0);
  }),
  test("addItem puts an item in the cart with quantity 1 by default", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    assertEqual(cart.getItems(), [{ ...apple, quantity: 1 }]);
    assertEqual(cart.isEmpty(), false);
  }),
  test("addItem uses the given quantity", () => {
    const cart = new ShoppingCart();
    cart.addItem({ ...apple, quantity: 3 });
    assertEqual(cart.getItems(), [{ ...apple, quantity: 3 }]);
  }),
  test("addItem keeps items in the order they were added", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    cart.addItem(bread);
    assertEqual(
      cart.getItems().map((item) => item.id),
      ["apple", "bread"],
    );
  }),
  test("adding the same item again increases its quantity", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    cart.addItem({ ...apple, quantity: 2 });
    assertEqual(cart.getItems(), [{ ...apple, quantity: 3 }]);
  }),
  test("adding an existing id with another price is rejected", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    assertThrows(() => cart.addItem({ ...apple, priceCents: 99 }), "different price");
    assertEqual(cart.getItems(), [{ ...apple, quantity: 1 }]);
  }),
  test("addItem rejects a quantity that is not a positive integer", () => {
    const cart = new ShoppingCart();
    assertThrows(() => cart.addItem({ ...apple, quantity: 0 }), "Quantity");
    assertThrows(() => cart.addItem({ ...apple, quantity: -1 }), "Quantity");
    assertThrows(() => cart.addItem({ ...apple, quantity: 1.5 }), "Quantity");
    assertEqual(cart.isEmpty(), true);
  }),
  test("addItem rejects a price that is not a non-negative integer of cents", () => {
    const cart = new ShoppingCart();
    assertThrows(() => cart.addItem({ ...apple, priceCents: -1 }), "Price");
    assertThrows(() => cart.addItem({ ...apple, priceCents: 0.5 }), "Price");
    assertEqual(cart.isEmpty(), true);
  }),
  test("addItem rejects an empty id or name", () => {
    const cart = new ShoppingCart();
    assertThrows(() => cart.addItem({ ...apple, id: "" }), "id");
    assertThrows(() => cart.addItem({ ...apple, name: "  " }), "name");
  }),
  test("removeItem removes the item from the cart", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    cart.addItem(bread);
    cart.removeItem("apple");
    assertEqual(cart.getItems(), [{ ...bread, quantity: 1 }]);
  }),
  test("removeItem removes the whole line, whatever its quantity", () => {
    const cart = new ShoppingCart();
    cart.addItem({ ...apple, quantity: 4 });
    cart.removeItem("apple");
    assertEqual(cart.isEmpty(), true);
  }),
  test("removeItem rejects an id that is not in the cart", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    assertThrows(() => cart.removeItem("pear"), "not in the cart");
    assertEqual(cart.getItems(), [{ ...apple, quantity: 1 }]);
  }),
  test("totalCents sums price times quantity", () => {
    const cart = new ShoppingCart();
    cart.addItem({ ...apple, quantity: 4 });
    cart.addItem(bread);
    assertEqual(cart.totalCents(), 450);
  }),
  test("changing the returned items does not change the cart", () => {
    const cart = new ShoppingCart();
    cart.addItem(apple);
    const items = cart.getItems() as unknown as { quantity: number }[];
    items[0]!.quantity = 99;
    items.pop();
    assertEqual(cart.getItems(), [{ ...apple, quantity: 1 }]);
  }),
  test("changing the object passed to addItem does not change the cart", () => {
    const cart = new ShoppingCart();
    const input = { ...apple, quantity: 2 };
    cart.addItem(input);
    input.quantity = 50;
    assertEqual(cart.getItems(), [{ ...apple, quantity: 2 }]);
  }),
];
