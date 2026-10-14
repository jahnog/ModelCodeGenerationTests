export type Cart = {
  items: string[];
};

export function addItem(cart: Cart, item: string): void {
  cart.items.push(item);
}

export function showItems(cart: Cart): string[] {
  return cart.items;
}

export function removeItem(cart: Cart, item: string): void {
  cart.items = cart.items.filter((name) => name !== item);
}

const cart: Cart = { items: [] };

addItem(cart, "milk");
export const shown = showItems(cart);
removeItem(cart, "milk");
