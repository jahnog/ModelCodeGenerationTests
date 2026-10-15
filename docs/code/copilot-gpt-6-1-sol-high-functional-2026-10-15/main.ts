import { addItem, createCart, removeItem, showCart } from "./shopping-cart";

const emptyCart = createCart();
const cartWithBook = addItem(emptyCart, {
  id: "book",
  name: "TypeScript Book",
  priceInCents: 2499,
});
const cartWithMug = addItem(cartWithBook, {
  id: "mug",
  name: "Coffee Mug",
  priceInCents: 1250,
});

console.log("Shopping cart:");
console.log(showCart(cartWithMug));

const cartAfterRemoval = removeItem(cartWithMug, "book");

console.log("\nAfter removing the book:");
console.log(showCart(cartAfterRemoval));

export {};
