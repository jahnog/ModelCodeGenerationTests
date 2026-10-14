import type { CartResult } from "../../model/cart-line";

export interface AddItemCommand {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface AddItemToCart {
  add(command: AddItemCommand): CartResult;
}
