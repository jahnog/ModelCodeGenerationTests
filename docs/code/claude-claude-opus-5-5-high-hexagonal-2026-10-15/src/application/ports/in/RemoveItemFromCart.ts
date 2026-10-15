import type { CartView } from "./CartView";

export interface RemoveItemFromCartCommand {
  readonly cartId: string;
  readonly productId: string;
}

export interface RemoveItemFromCartUseCase {
  removeItem(command: RemoveItemFromCartCommand): Promise<CartView>;
}
