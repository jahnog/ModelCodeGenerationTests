export const cart: string[] = [];

export function addItem(item: string): void {
  cart.push(item);
}

export function showItems(): void {
  console.log("Cart:", cart.length ? cart.join(", ") : "(empty)");
}

export function removeItem(item: string): void {
  const index = cart.indexOf(item);
  if (index !== -1) {
    cart.splice(index, 1);
  }
}

addItem("apple");
addItem("bread");
showItems();
removeItem("apple");
showItems();
