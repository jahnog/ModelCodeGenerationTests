import type { Cents } from "./money";

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly unitPrice: Cents;
}

export interface CartItem {
  readonly product: Product;
  readonly quantity: number;
}

export type RemoveResult =
  | { readonly kind: "removed"; readonly item: CartItem }
  | { readonly kind: "decreased"; readonly item: CartItem; readonly remaining: number }
  | { readonly kind: "not-found"; readonly productId: string };
