import { ShoppingCart } from "./shopping-cart";

// Run without installing dependencies (Node.js 24+):
// sed 's|"./shopping-cart"|"./shopping-cart.ts"|' main.ts | node --input-type=module-typescript
// Type-check with TypeScript 7.0.2:
// tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler *.ts
export function main(): void {
  const cart = new ShoppingCart();
  cart.addItem({ id: "apple", name: "Apple", price: 1.25 });
  cart.addItem({ id: "bread", name: "Bread", price: 2.5 });

  console.log("Shopping cart:");
  console.log(cart.showItems());

  cart.removeItem("apple");
  console.log("\nAfter removing apple:");
  console.log(cart.showItems());
}

main();
