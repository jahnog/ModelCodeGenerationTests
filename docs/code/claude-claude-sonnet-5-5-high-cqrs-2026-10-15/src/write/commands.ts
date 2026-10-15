import type { CartId, ProductId } from "../domain/events";

export interface AddItemToCart {
  readonly type: "AddItemToCart";
  readonly cartId: CartId;
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemFromCart {
  readonly type: "RemoveItemFromCart";
  readonly cartId: CartId;
  readonly productId: ProductId;
}

export type Command = AddItemToCart | RemoveItemFromCart;
