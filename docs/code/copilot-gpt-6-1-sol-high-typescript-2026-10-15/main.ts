import { ShoppingCart } from "./shopping-cart";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function showCart(cart: ShoppingCart): void {
  const items = cart.getItems();
  console.log("\nShopping cart:");

  if (items.length === 0) {
    console.log("Your cart is empty.");
  }

  for (const item of items) {
    const unitPrice = currency.format(item.unitPriceCents / 100);
    const subtotal = currency.format(
      (item.unitPriceCents * item.quantity) / 100,
    );
    console.log(
      `${item.name} [${item.id}] - ${item.quantity} x ${unitPrice} = ${subtotal}`,
    );
  }

  console.log(`Total: ${currency.format(cart.getTotalCents() / 100)}`);
}

const cart = new ShoppingCart();
const book = { id: "book", name: "TypeScript Handbook", unitPriceCents: 2500 };
const pen = { id: "pen", name: "Notebook Pen", unitPriceCents: 150 };

cart.addItem(book);
cart.addItem(pen, 2);
cart.addItem(book);
showCart(cart);

console.log("\nRemoving the pen:");
if (!cart.removeItem(pen.id)) {
  throw new Error(`Product "${pen.id}" was not in the cart.`);
}
showCart(cart);

cart.removeItem(book.id);
showCart(cart);
