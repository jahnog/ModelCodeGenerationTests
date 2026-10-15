import { ShoppingCart } from "./shopping-cart";

export function showCart(cart: ShoppingCart): void {
  const items = cart.getItems();

  if (items.length === 0) {
    console.log("The shopping cart is empty.");
    return;
  }

  console.log("Shopping cart:");
  for (const item of items) {
    console.log(`${item.id}: ${item.name} - $${item.price.toFixed(2)}`);
  }
}

const cart = new ShoppingCart();

cart.addItem({ id: "book", name: "TypeScript Book", price: 29.99 });
cart.addItem({ id: "notebook", name: "Notebook", price: 4.5 });
showCart(cart);

if (cart.removeItem("book")) {
  console.log("\nRemoved the TypeScript Book.");
}
showCart(cart);
