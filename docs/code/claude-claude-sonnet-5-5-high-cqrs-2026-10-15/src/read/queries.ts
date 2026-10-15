import type { CartId } from "../domain/events";

export interface GetCartItems {
  readonly type: "GetCartItems";
  readonly cartId: CartId;
}

export type Query = GetCartItems;
