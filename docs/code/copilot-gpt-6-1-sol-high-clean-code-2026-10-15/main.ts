import { ShoppingCart } from "./shopping-cart";

function showCart(cart: ShoppingCart): void {
  const items = cart.getItems();

  if (items.length === 0) {
    console.log("The shopping cart is empty.");
    return;
  }

  for (const item of items) {
    console.log(`${item.id}: ${item.name} - ${item.price.toFixed(2)}`);
  }
}

const cart = new ShoppingCart();

cart.addItem({ id: "book", name: "Notebook", price: 4.5 });
cart.addItem({ id: "pen", name: "Pen", price: 1.25 });

console.log("Shopping cart:");
showCart(cart);

cart.removeItem("book");

console.log("\nShopping cart after removing the notebook:");
showCart(cart);

export {};
