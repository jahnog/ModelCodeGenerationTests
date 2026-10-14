export type AddItemRequest = {
  readonly id: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
};

export type AddedItem = {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
};

export type RemovedItem = {
  readonly id: string;
  readonly name: string;
};

export type CartLine = {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
  readonly lineTotalCents: number;
};

export type CartContents = {
  readonly lines: readonly CartLine[];
  readonly totalCents: number;
};
