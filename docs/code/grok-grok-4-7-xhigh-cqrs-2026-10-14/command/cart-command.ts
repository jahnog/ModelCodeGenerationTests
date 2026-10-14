export interface AddItemCommand {
  readonly kind: "AddItem";
  readonly cartId: string;
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface RemoveItemCommand {
  readonly kind: "RemoveItem";
  readonly cartId: string;
  readonly itemId: string;
}

export type CartCommand = AddItemCommand | RemoveItemCommand;

export type CommandAcknowledgement =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly reason: string };

export function acceptedCommand(): CommandAcknowledgement {
  return { accepted: true };
}

export function rejectedCommand(reason: string): CommandAcknowledgement {
  return { accepted: false, reason };
}
