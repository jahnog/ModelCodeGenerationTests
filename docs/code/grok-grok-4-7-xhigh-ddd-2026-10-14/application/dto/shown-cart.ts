export interface ShownCartItem {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly currency: string;
  readonly lineTotalMinor: number;
}

export interface ShownCart {
  readonly cartId: string;
  readonly lineCount: number;
  readonly unitCount: number;
  readonly items: readonly ShownCartItem[];
  readonly totalMinor: number | undefined;
  readonly currency: string | undefined;
}
