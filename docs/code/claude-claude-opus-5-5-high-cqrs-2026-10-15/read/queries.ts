// Queries ask for data. They never change state.

export interface GetCartQuery {
  readonly type: "GetCart";
  readonly cartId: string;
}
