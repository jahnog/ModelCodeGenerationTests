// Commands express an intent to change state. They return no data,
// only whether the change was accepted.

export interface AddItemCommand {
  readonly type: "AddItem";
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemCommand {
  readonly type: "RemoveItem";
  readonly cartId: string;
  readonly productId: string;
}

export type CartCommand = AddItemCommand | RemoveItemCommand;

export type CommandResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };
