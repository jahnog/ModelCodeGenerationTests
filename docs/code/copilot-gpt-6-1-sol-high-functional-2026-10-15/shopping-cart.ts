export type Item = Readonly<{
  id: string;
  name: string;
  priceInCents: number;
}>;

export type ShoppingCart = readonly Item[];

export const createCart = (): ShoppingCart => Object.freeze([]);

// Item IDs identify individual cart entries and must be unique.
export const addItem = (
  cart: ShoppingCart,
  item: Item,
): ShoppingCart => {
  if (item.id.trim() === "" || item.name.trim() === "") {
    throw new Error("An item must have a non-empty ID and name.");
  }

  if (!Number.isSafeInteger(item.priceInCents) || item.priceInCents < 0) {
    throw new RangeError("An item's price must be a non-negative safe integer in cents.");
  }

  if (cart.some((entry) => entry.id === item.id)) {
    throw new Error(`An item with ID "${item.id}" is already in the cart.`);
  }

  return Object.freeze([...cart, Object.freeze({ ...item })]);
};

export const removeItem = (
  cart: ShoppingCart,
  itemId: string,
): ShoppingCart => Object.freeze(cart.filter((item) => item.id !== itemId));

// Returning text keeps presentation pure; the caller chooses where to display it.
export const showCart = (cart: ShoppingCart): string =>
  cart.length === 0
    ? "Your shopping cart is empty."
    : cart
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} [${item.id}] - $${(item.priceInCents / 100).toFixed(2)}`,
        )
        .join("\n");
