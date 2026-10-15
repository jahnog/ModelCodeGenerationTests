import type { Cents } from "./money";

export type ProductId = string;

export interface CartLine {
  readonly productId: ProductId;
  readonly name: string;
  readonly unitPriceCents: Cents;
  readonly quantity: number;
}

/** Storage port shared by all cart slices. Lines are replaced, never mutated. */
export interface CartStore {
  load(): readonly CartLine[];
  save(lines: readonly CartLine[]): void;
}

export const createInMemoryCartStore = (): CartStore => {
  let lines: readonly CartLine[] = [];
  return {
    load: () => lines,
    save: (next) => {
      lines = [...next];
    },
  };
};
