import { subtotalInCents, type CartItem } from "./cartItem";
import { formatCents } from "./money";
import type { ShoppingCart } from "./shoppingCart";

const EMPTY_CART_MESSAGE = "Your shopping cart is empty.";

export function renderCart(cart: ShoppingCart): string {
  if (cart.isEmpty()) {
    return EMPTY_CART_MESSAGE;
  }

  const itemLines = cart.getItems().map(renderItem);
  const totalLine = `Total: ${formatCents(cart.totalInCents())}`;
  return ["Shopping cart:", ...itemLines, totalLine].join("\n");
}

function renderItem(item: CartItem): string {
  const { product, quantity } = item;
  const unitPrice = formatCents(product.priceInCents);
  const subtotal = formatCents(subtotalInCents(item));
  return `  - ${product.name} (${product.id}): ${quantity} x ${unitPrice} = ${subtotal}`;
}
