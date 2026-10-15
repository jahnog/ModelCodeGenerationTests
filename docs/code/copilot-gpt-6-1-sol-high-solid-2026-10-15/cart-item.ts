export interface CartItem {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartContents {
  getItems(): readonly CartItem[];
}
