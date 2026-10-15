import type { CartItem, ShoppingCart } from "./shopping-cart";

// Driving port: the operations available to user-facing adapters.
export interface ShoppingCartUseCases {
  addItem(item: CartItem): void;
  getItems(): readonly CartItem[];
  removeItem(id: string): void;
}

// Driven port: persistence is supplied by an infrastructure adapter.
export interface ShoppingCartRepository {
  load(): ShoppingCart;
  save(cart: ShoppingCart): void;
}
