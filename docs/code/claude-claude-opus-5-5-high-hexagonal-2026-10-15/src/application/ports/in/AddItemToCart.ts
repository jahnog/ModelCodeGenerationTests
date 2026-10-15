import type { CartView } from "./CartView";

export interface AddItemToCartCommand {
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface AddItemToCartUseCase {
  addItem(command: AddItemToCartCommand): Promise<CartView>;
}
