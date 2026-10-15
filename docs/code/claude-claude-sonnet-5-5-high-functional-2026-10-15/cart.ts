export type CartItem = Readonly<{
  id: string;
  name: string;
  /** Unit price in cents, to avoid floating point errors. */
  priceCents: number;
  quantity: number;
}>;

export type Cart = ReadonlyArray<CartItem>;

export const emptyCart: Cart = [];

/** Adds an item. If an item with the same id exists, its quantity grows. */
export const addItem = (cart: Cart, item: CartItem): Cart =>
  cart.some((existing) => existing.id === item.id)
    ? cart.map((existing) =>
        existing.id === item.id
          ? { ...existing, quantity: existing.quantity + item.quantity }
          : existing,
      )
    : [...cart, item];

/** Removes the item with the given id. Unknown ids leave the cart unchanged. */
export const removeItem = (cart: Cart, id: string): Cart =>
  cart.filter((item) => item.id !== id);

export const lineTotalCents = (item: CartItem): number =>
  item.priceCents * item.quantity;

export const totalCents = (cart: Cart): number =>
  cart.reduce((sum, item) => sum + lineTotalCents(item), 0);

export const formatMoney = (cents: number): string =>
  `$${(cents / 100).toFixed(2)}`;

const formatItem = (item: CartItem): string =>
  `${item.name} x${item.quantity} @ ${formatMoney(item.priceCents)} = ${formatMoney(lineTotalCents(item))}`;

/** Builds the text that lists the cart contents and the total. */
export const showCart = (cart: Cart): string =>
  cart.length === 0
    ? "The shopping cart is empty."
    : [
        ...cart.map((item, index) => `${index + 1}. ${formatItem(item)}`),
        `Total: ${formatMoney(totalCents(cart))}`,
      ].join("\n");
