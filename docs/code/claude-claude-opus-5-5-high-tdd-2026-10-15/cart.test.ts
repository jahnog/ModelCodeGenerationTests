import { formatCart, formatPrice, ShoppingCart } from "./cart";
import { assertEqual, assertThrows, test } from "./testing";

test("a new cart has no items", () => {
  assertEqual(new ShoppingCart().getItems(), []);
});

test("adding an item puts it in the cart", () => {
  const cart = new ShoppingCart();
  cart.addItem("apple", 50, 3);
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 3 }]);
});

test("quantity defaults to 1", () => {
  const cart = new ShoppingCart();
  cart.addItem("bread", 250);
  assertEqual(cart.getItems(), [{ name: "bread", priceCents: 250, quantity: 1 }]);
});

test("items are listed in the order they were added", () => {
  const cart = new ShoppingCart();
  cart.addItem("milk", 120);
  cart.addItem("eggs", 300);
  assertEqual(
    cart.getItems().map((item) => item.name),
    ["milk", "eggs"],
  );
});

test("adding an item that is already in the cart increases its quantity", () => {
  const cart = new ShoppingCart();
  cart.addItem("apple", 50, 2);
  cart.addItem("apple", 50, 3);
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 5 }]);
});

test("item names are trimmed and matched without regard to case", () => {
  const cart = new ShoppingCart();
  cart.addItem("  Apple ", 50);
  cart.addItem("apple", 50);
  assertEqual(cart.getItems(), [{ name: "Apple", priceCents: 50, quantity: 2 }]);
});

test("adding an existing item with a different price is rejected", () => {
  const cart = new ShoppingCart();
  cart.addItem("apple", 50);
  assertThrows(() => cart.addItem("apple", 60), 'already in the cart at $0.50');
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 1 }]);
});

test("adding an item with an empty name is rejected", () => {
  assertThrows(() => new ShoppingCart().addItem("   ", 50), "name must not be empty");
});

test("adding an item with an invalid price is rejected", () => {
  const cart = new ShoppingCart();
  assertThrows(() => cart.addItem("apple", -1), "price must be a whole number of cents >= 0");
  assertThrows(() => cart.addItem("apple", 1.5), "price must be a whole number of cents >= 0");
  assertThrows(() => cart.addItem("apple", Number.NaN), "price must be a whole number of cents >= 0");
});

test("a free item is allowed", () => {
  const cart = new ShoppingCart();
  cart.addItem("sample", 0);
  assertEqual(cart.getItems(), [{ name: "sample", priceCents: 0, quantity: 1 }]);
});

test("adding an item with an invalid quantity is rejected", () => {
  const cart = new ShoppingCart();
  assertThrows(() => cart.addItem("apple", 50, 0), "quantity must be a whole number >= 1");
  assertThrows(() => cart.addItem("apple", 50, 2.5), "quantity must be a whole number >= 1");
  assertEqual(cart.getItems(), []);
});

test("changing the returned list does not change the cart", () => {
  const cart = new ShoppingCart();
  cart.addItem("apple", 50);
  cart.getItems().pop();
  assertEqual(cart.getItems().length, 1);
});

function cartWithFruit(): ShoppingCart {
  const cart = new ShoppingCart();
  cart.addItem("apple", 50, 3);
  cart.addItem("banana", 25, 6);
  cart.addItem("cherry", 10, 20);
  return cart;
}

test("removing an item takes it out of the cart", () => {
  const cart = cartWithFruit();
  cart.removeItem("banana");
  assertEqual(
    cart.getItems().map((item) => item.name),
    ["apple", "cherry"],
  );
});

test("removing an item matches its name without regard to case or spaces", () => {
  const cart = cartWithFruit();
  cart.removeItem("  APPLE ");
  assertEqual(
    cart.getItems().map((item) => item.name),
    ["banana", "cherry"],
  );
});

test("removing part of an item's quantity keeps the rest in place", () => {
  const cart = cartWithFruit();
  cart.removeItem("banana", 4);
  assertEqual(cart.getItems(), [
    { name: "apple", priceCents: 50, quantity: 3 },
    { name: "banana", priceCents: 25, quantity: 2 },
    { name: "cherry", priceCents: 10, quantity: 20 },
  ]);
});

test("removing an item's whole quantity takes it out of the cart", () => {
  const cart = cartWithFruit();
  cart.removeItem("apple", 3);
  assertEqual(
    cart.getItems().map((item) => item.name),
    ["banana", "cherry"],
  );
});

test("removing more than the cart holds is rejected", () => {
  const cart = cartWithFruit();
  assertThrows(() => cart.removeItem("apple", 4), 'only 3 of "apple"');
  assertEqual(cart.getItems().length, 3);
});

test("removing an item that is not in the cart is rejected", () => {
  assertThrows(() => cartWithFruit().removeItem("durian"), '"durian" is not in the cart');
});

test("removing an invalid quantity is rejected", () => {
  const cart = cartWithFruit();
  assertThrows(() => cart.removeItem("apple", 0), "quantity must be a whole number >= 1");
  assertThrows(() => cart.removeItem("apple", 1.5), "quantity must be a whole number >= 1");
});

test("an item can be added again after it was removed", () => {
  const cart = cartWithFruit();
  cart.removeItem("apple");
  cart.addItem("apple", 55);
  assertEqual(cart.getItems()[2], { name: "apple", priceCents: 55, quantity: 1 });
});

test("prices are formatted as dollars and cents", () => {
  assertEqual(formatPrice(0), "$0.00");
  assertEqual(formatPrice(5), "$0.05");
  assertEqual(formatPrice(1250), "$12.50");
  assertEqual(formatPrice(100000), "$1000.00");
});

test("the total adds up every item's price times its quantity", () => {
  assertEqual(new ShoppingCart().getTotalCents(), 0);
  assertEqual(cartWithFruit().getTotalCents(), 3 * 50 + 6 * 25 + 20 * 10);
});

test("showing an empty cart says it is empty", () => {
  assertEqual(formatCart(new ShoppingCart()), "The cart is empty.");
});

test("showing a cart lists each item with its subtotal, then the total", () => {
  const cart = cartWithFruit();
  cart.addItem("bread", 1250);
  assertEqual(
    formatCart(cart),
    [
      "1. apple  - 3 x $0.50 = $1.50",
      "2. banana - 6 x $0.25 = $1.50",
      "3. cherry - 20 x $0.10 = $2.00",
      "4. bread  - 1 x $12.50 = $12.50",
      "Total: $17.50",
    ].join("\n"),
  );
});
