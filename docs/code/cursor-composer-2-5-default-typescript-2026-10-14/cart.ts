export type Item = {
  readonly id: string;
  readonly name: string;
};

export type Cart = {
  readonly items: readonly Item[];
};

export function addItem(cart: Cart, item: Item): Cart {
  return { items: [...cart.items, item] };
}

export function showItems(cart: Cart): readonly Item[] {
  return cart.items;
}

export function removeItem(cart: Cart, id: string): Cart {
  return { items: cart.items.filter((item) => item.id !== id) };
}
