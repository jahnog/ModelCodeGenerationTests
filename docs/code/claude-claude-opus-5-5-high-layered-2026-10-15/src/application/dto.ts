export interface AddItemRequest {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartItemDto {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly subtotalCents: number;
}

export interface CartDto {
  readonly items: readonly CartItemDto[];
  readonly totalCents: number;
}
