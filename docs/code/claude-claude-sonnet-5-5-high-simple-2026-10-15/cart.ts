export type Item = { name: string; price: number };

export const cart: Item[] = [];

export function addItem(item: Item): void {
  cart.push(item);
}

export function showItems(): void {
  if (cart.length === 0) {
    console.log("The cart is empty");
    return;
  }
  cart.forEach((item, i) => console.log(`${i + 1}. ${item.name} - $${item.price}`));
}

export function removeItem(name: string): void {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) cart.splice(index, 1);
}

addItem({ name: "Apple", price: 1 });
addItem({ name: "Bread", price: 3 });
showItems();
removeItem("Apple");
showItems();
