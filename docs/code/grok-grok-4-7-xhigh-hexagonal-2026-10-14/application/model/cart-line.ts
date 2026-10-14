export interface CartLine {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export type CartResult =
  | { readonly ok: true; readonly items: readonly CartLine[] }
  | { readonly ok: false; readonly message: string };
