import { CartError, formatCart, formatPrice, ShoppingCart } from "./cart";

const ADD_USAGE = "Usage: add <name> <price> [quantity]";
const REMOVE_USAGE = "Usage: remove <name> [quantity]";
const HELP = [
  "Commands:",
  "  add <name> <price> [quantity]   add an item to the cart",
  "  show                            show the items in the cart",
  "  remove <name> [quantity]        remove an item from the cart",
  "  help                            show this help",
].join("\n");

/** Parses a dollar amount such as "2", "1.99" or "$0.50" to cents; returns undefined if it is not one. */
export function parsePriceCents(text: string): number | undefined {
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (match === null) return undefined;
  const [, dollars = "", cents = ""] = match;
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
}

function isWholeNumber(text: string | undefined): text is string {
  return text !== undefined && /^\d+$/.test(text);
}

function add(cart: ShoppingCart, args: string[]): string {
  // The name may have several words and the quantity is optional, so read from the end:
  // <name...> <price> [quantity].
  const last = args.at(-1);
  const hasQuantity = args.length >= 3 && isWholeNumber(last) && parsePriceCents(args.at(-2) ?? "") !== undefined;
  const priceIndex = hasQuantity ? -2 : -1;
  const priceCents = parsePriceCents(args.at(priceIndex) ?? "");
  const nameWords = args.slice(0, priceIndex);
  if (priceCents === undefined || nameWords.length === 0) return ADD_USAGE;

  const name = nameWords.join(" ");
  const quantity = hasQuantity ? Number(last) : 1;
  cart.addItem(name, priceCents, quantity);
  return `Added ${quantity} x ${name} at ${formatPrice(priceCents)} each.`;
}

function remove(cart: ShoppingCart, args: string[]): string {
  if (args.length === 0) return REMOVE_USAGE;
  const last = args.at(-1);
  if (args.length >= 2 && isWholeNumber(last)) {
    const name = args.slice(0, -1).join(" ");
    cart.removeItem(name, Number(last));
    return `Removed ${last} x ${name}.`;
  }
  const name = args.join(" ");
  cart.removeItem(name);
  return `Removed ${name}.`;
}

/** Runs one line of user input against the cart and returns the text to show. */
export function executeCommand(cart: ShoppingCart, line: string): string {
  const [command = "", ...args] = line.trim().split(/\s+/).filter((word) => word !== "");
  try {
    switch (command.toLowerCase()) {
      case "add":
        return add(cart, args);
      case "show":
        return formatCart(cart);
      case "remove":
        return remove(cart, args);
      case "help":
        return HELP;
      case "":
        return 'Type "help" for the commands.';
      default:
        return `Unknown command "${command}". Type "help" for the commands.`;
    }
  } catch (error) {
    if (error instanceof CartError) return `Error: ${error.message}`;
    throw error;
  }
}

/** Runs the commands in order and returns a transcript of each command and its result. */
export function runSession(cart: ShoppingCart, lines: readonly string[]): string {
  return lines.map((line) => `> ${line}\n${executeCommand(cart, line)}`).join("\n\n");
}
