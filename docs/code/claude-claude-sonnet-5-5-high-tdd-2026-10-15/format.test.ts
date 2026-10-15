import { formatCart, formatCents } from "./format";
import { assertEqual, test, type TestCase } from "./testing";

export const formatTests: readonly TestCase[] = [
  test("formatCents shows dollars and two-digit cents", () => {
    assertEqual(formatCents(0), "$0.00");
    assertEqual(formatCents(5), "$0.05");
    assertEqual(formatCents(1050), "$10.50");
    assertEqual(formatCents(123456), "$1234.56");
  }),
  test("formatCart says so when the cart is empty", () => {
    assertEqual(formatCart([]), "Your cart is empty.");
  }),
  test("formatCart lists each item and the total", () => {
    const text = formatCart([
      { id: "apple", name: "Apple", priceCents: 50, quantity: 4 },
      { id: "bread", name: "Bread", priceCents: 250, quantity: 1 },
    ]);
    assertEqual(
      text,
      [
        "4 x Apple @ $0.50 = $2.00",
        "1 x Bread @ $2.50 = $2.50",
        "Total: $4.50",
      ].join("\n"),
    );
  }),
];
