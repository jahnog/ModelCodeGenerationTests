import type { CartLine } from "../../model/cart-line";

export interface RemoveItemCommand {
  readonly id: string;
}

export type RemoveItemResult =
  | {
      readonly ok: true;
      readonly removed: CartLine;
      readonly items: readonly CartLine[];
    }
  | { readonly ok: false; readonly message: string };

export interface RemoveItemFromCart {
  remove(command: RemoveItemCommand): RemoveItemResult;
}
