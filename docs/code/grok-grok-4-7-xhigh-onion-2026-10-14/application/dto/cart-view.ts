export interface CartItemData {
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface CartView {
  readonly ok: true;
  readonly items: readonly CartItemData[];
  readonly itemCount: number;
  readonly totalCents: number;
}

export interface CartFailure {
  readonly ok: false;
  readonly code: string;
  readonly message: string;
}

export type CartResult = CartView | CartFailure;

export interface RemovedItemView extends CartView {
  readonly removed: CartItemData;
}

export type RemoveItemResult = RemovedItemView | CartFailure;
