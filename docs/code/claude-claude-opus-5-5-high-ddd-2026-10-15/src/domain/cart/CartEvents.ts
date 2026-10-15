import type { DomainEvent } from "../shared/DomainEvent";

export interface ItemAddedToCart extends DomainEvent {
  readonly type: "ItemAddedToCart";
  readonly cartId: string;
  readonly productId: string;
  readonly quantityAdded: number;
  readonly newQuantity: number;
}

export interface ItemRemovedFromCart extends DomainEvent {
  readonly type: "ItemRemovedFromCart";
  readonly cartId: string;
  readonly productId: string;
}

export type CartEvent = ItemAddedToCart | ItemRemovedFromCart;

export function isCartEvent(event: DomainEvent): event is CartEvent {
  return event.type === "ItemAddedToCart" || event.type === "ItemRemovedFromCart";
}
