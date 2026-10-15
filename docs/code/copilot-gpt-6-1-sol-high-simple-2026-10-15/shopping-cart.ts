const items: string[] = [];

export function addItem(item: string): void {
  items.push(item);
}

export function showItems(): void {
  console.log("Shopping cart:", items);
}

export function removeItem(item: string): boolean {
  const index = items.indexOf(item);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  return true;
}

addItem("Apple");
addItem("Banana");
showItems();

removeItem("Apple");
showItems();
