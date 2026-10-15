import { ShoppingCart } from "./cart";
import { executeCommand, parsePriceCents, runSession } from "./commands";
import { assertEqual, test } from "./testing";

test("prices in dollars are parsed to cents", () => {
  assertEqual(parsePriceCents("2"), 200);
  assertEqual(parsePriceCents("0.5"), 50);
  assertEqual(parsePriceCents("1.99"), 199);
  assertEqual(parsePriceCents("$12.05"), 1205);
});

test("text that is not a price is not parsed", () => {
  for (const text of ["", "abc", "1.999", "-1", "1.", ".5", "1,50", "$"]) {
    assertEqual(parsePriceCents(text), undefined, text);
  }
});

test("add puts an item in the cart and confirms it", () => {
  const cart = new ShoppingCart();
  assertEqual(executeCommand(cart, "add apple 0.50"), "Added 1 x apple at $0.50 each.");
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 1 }]);
});

test("add accepts a quantity after the price", () => {
  const cart = new ShoppingCart();
  assertEqual(executeCommand(cart, "add apple 0.50 3"), "Added 3 x apple at $0.50 each.");
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 3 }]);
});

test("add accepts a name with several words", () => {
  const cart = new ShoppingCart();
  executeCommand(cart, "add green tea 4.25 2");
  executeCommand(cart, "add 7 Up 1.99");
  assertEqual(cart.getItems(), [
    { name: "green tea", priceCents: 425, quantity: 2 },
    { name: "7 Up", priceCents: 199, quantity: 1 },
  ]);
});

test("add without a name or a valid price explains the usage", () => {
  const cart = new ShoppingCart();
  for (const line of ["add", "add apple", "add 0.50", "add apple cheap"]) {
    assertEqual(executeCommand(cart, line), "Usage: add <name> <price> [quantity]", line);
  }
  assertEqual(cart.getItems(), []);
});

test("errors from the cart are reported instead of thrown", () => {
  const cart = new ShoppingCart();
  executeCommand(cart, "add apple 0.50");
  assertEqual(executeCommand(cart, "add apple 0.60"), 'Error: "apple" is already in the cart at $0.50.');
  assertEqual(executeCommand(cart, "add pear 1 0"), "Error: Item quantity must be a whole number >= 1.");
  assertEqual(executeCommand(cart, "remove pear"), 'Error: "pear" is not in the cart.');
});

test("show lists the items in the cart", () => {
  const cart = new ShoppingCart();
  assertEqual(executeCommand(cart, "show"), "The cart is empty.");
  executeCommand(cart, "add apple 0.50 2");
  assertEqual(executeCommand(cart, "show"), "1. apple - 2 x $0.50 = $1.00\nTotal: $1.00");
});

test("remove takes a whole item out of the cart", () => {
  const cart = new ShoppingCart();
  executeCommand(cart, "add green tea 4.25 2");
  assertEqual(executeCommand(cart, "remove green tea"), "Removed green tea.");
  assertEqual(cart.getItems(), []);
});

test("remove accepts a quantity after the name", () => {
  const cart = new ShoppingCart();
  executeCommand(cart, "add apple 0.50 5");
  assertEqual(executeCommand(cart, "remove apple 2"), "Removed 2 x apple.");
  assertEqual(cart.getItems(), [{ name: "apple", priceCents: 50, quantity: 3 }]);
});

test("remove without a name explains the usage", () => {
  assertEqual(executeCommand(new ShoppingCart(), "remove"), "Usage: remove <name> [quantity]");
});

test("commands ignore case and extra spaces", () => {
  const cart = new ShoppingCart();
  assertEqual(executeCommand(cart, "  ADD   apple   0.50  "), "Added 1 x apple at $0.50 each.");
  assertEqual(executeCommand(cart, "Show"), "1. apple - 1 x $0.50 = $0.50\nTotal: $0.50");
});

test("help lists the commands", () => {
  assertEqual(
    executeCommand(new ShoppingCart(), "help"),
    [
      "Commands:",
      "  add <name> <price> [quantity]   add an item to the cart",
      "  show                            show the items in the cart",
      "  remove <name> [quantity]        remove an item from the cart",
      "  help                            show this help",
    ].join("\n"),
  );
});

test("an unknown command points to help", () => {
  assertEqual(executeCommand(new ShoppingCart(), "buy apple"), 'Unknown command "buy". Type "help" for the commands.');
  assertEqual(executeCommand(new ShoppingCart(), "   "), 'Type "help" for the commands.');
});

test("a session runs each command in order and shows a transcript", () => {
  const cart = new ShoppingCart();
  assertEqual(
    runSession(cart, ["add apple 0.50 2", "remove apple 1", "show"]),
    [
      "> add apple 0.50 2",
      "Added 2 x apple at $0.50 each.",
      "",
      "> remove apple 1",
      "Removed 1 x apple.",
      "",
      "> show",
      "1. apple - 1 x $0.50 = $0.50",
      "Total: $0.50",
    ].join("\n"),
  );
});
