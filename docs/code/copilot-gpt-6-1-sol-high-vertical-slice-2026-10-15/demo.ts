import { addItem, createCart, removeItem, showItems } from "./index";
import type { ShoppingCart } from "./index";

export function runDemo(): ShoppingCart {
  let cart = createCart();

  cart = addItem(cart, {
    id: "book",
    name: "TypeScript Handbook",
    unitPriceCents: 2500,
  });
  cart = addItem(cart, {
    id: "pen",
    name: "Blue Pen",
    unitPriceCents: 150,
    quantity: 2,
  });
  console.log("Items in the shopping cart:", showItems(cart));

  cart = removeItem(cart, "book");
  console.log("After removing the book:", showItems(cart));

  return cart;
}

runDemo();
