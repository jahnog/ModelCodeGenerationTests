import { renderCart } from "./cartView";
import type { Product } from "./product";
import { ShoppingCart } from "./shoppingCart";

const APPLE: Product = { id: "apple", name: "Apple", priceInCents: 50 };
const BREAD: Product = { id: "bread", name: "Bread", priceInCents: 275 };
const MILK: Product = { id: "milk", name: "Milk", priceInCents: 199 };

export function runShoppingCartDemo(): void {
  const cart = new ShoppingCart();
  showCart(cart);

  cart.addItem(APPLE, 3);
  cart.addItem(BREAD);
  cart.addItem(MILK, 2);
  showCart(cart);

  const removedItem = cart.removeItem(BREAD.id);
  console.log(`Removed ${removedItem.product.name} from the cart.`);
  showCart(cart);
}

function showCart(cart: ShoppingCart): void {
  console.log(renderCart(cart));
  console.log();
}

runShoppingCartDemo();
