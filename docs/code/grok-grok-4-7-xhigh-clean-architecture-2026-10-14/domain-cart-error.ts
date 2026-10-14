// Entity-layer error. No outer-layer dependencies.

export type CartError =
  | { readonly code: "empty-id" }
  | { readonly code: "empty-name" }
  | { readonly code: "invalid-price" }
  | { readonly code: "invalid-quantity" }
  | { readonly code: "line-total-overflow" }
  | { readonly code: "cart-total-overflow" }
  | { readonly code: "item-conflict"; readonly itemId: string }
  | { readonly code: "item-not-found"; readonly itemId: string };
