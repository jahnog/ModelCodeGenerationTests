import type { CartLine } from "../../model/cart-line";

export interface CartSnapshot {
  readonly items: readonly CartLine[];
}

export interface ShowCartItems {
  show(): CartSnapshot;
}
