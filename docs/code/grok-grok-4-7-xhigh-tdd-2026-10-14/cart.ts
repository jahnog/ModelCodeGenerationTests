import type { Item } from "./item";

export type Cart = {
  readonly items: readonly Item[];
};

function copyItem(item: Item): Item {
  return { id: item.id, name: item.name };
}

export function createCart(): Cart {
  return { items: [] };
}

export function addItem(cart: Cart, item: Item): Cart {
  return { items: [...cart.items, copyItem(item)] };
}

export function showItems(cart: Cart): readonly Item[] {
  return cart.items.map(copyItem);
}

export function removeItem(cart: Cart, id: string): Cart {
  const index = cart.items.findIndex((item) => item.id === id);
  if (index < 0) {
    return { items: [...cart.items] };
  }
  return {
    items: [...cart.items.slice(0, index), ...cart.items.slice(index + 1)],
  };
}
