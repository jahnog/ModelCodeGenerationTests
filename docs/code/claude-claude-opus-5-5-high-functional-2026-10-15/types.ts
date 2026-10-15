// Domain types. Everything is readonly: values are never mutated, only replaced.

export type Item = {
  readonly id: string;
  readonly name: string;
  readonly priceCents: number;
  readonly quantity: number;
};

export type Cart = {
  readonly items: readonly Item[];
};

export type CartError =
  | { readonly kind: "invalid-item"; readonly reason: string }
  | { readonly kind: "item-not-found"; readonly id: string };

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });

export const err = <E, T = never>(error: E): Result<T, E> => ({ ok: false, error });
