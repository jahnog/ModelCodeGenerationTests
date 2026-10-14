import type { DomainEvent, EventEnvelope, ShownCart, ShownLine } from "../events/cart-message";

export interface CartLine {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export interface CartState {
  readonly lines: readonly CartLine[];
}

export function emptyCartState(): CartState {
  return { lines: [] };
}

export function applyDomainEvent(state: CartState, event: DomainEvent): CartState {
  if (event.type === "ItemAddedToCart") {
    const index = state.lines.findIndex((line) => line.itemId === event.itemId);
    if (index === -1) {
      return {
        lines: [
          ...state.lines,
          {
            itemId: event.itemId,
            name: event.name,
            unitPriceCents: event.unitPriceCents,
            quantity: event.quantity,
          },
        ],
      };
    }
    return {
      lines: state.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, quantity: line.quantity + event.quantity } : line,
      ),
    };
  }

  const current = state.lines.find((line) => line.itemId === event.itemId);
  if (current === undefined) {
    return state;
  }
  const remaining = current.quantity - event.quantity;
  if (remaining <= 0) {
    return { lines: state.lines.filter((line) => line.itemId !== event.itemId) };
  }
  return {
    lines: state.lines.map((line) =>
      line.itemId === event.itemId ? { ...line, quantity: remaining } : line,
    ),
  };
}

export function foldCart(records: readonly EventEnvelope<DomainEvent>[]): CartState {
  return records.reduce((state, record) => applyDomainEvent(state, record.event), emptyCartState());
}

export function toShownCart(state: CartState): ShownCart {
  const lines: ShownLine[] = state.lines.map((line) => ({
    itemId: line.itemId,
    name: line.name,
    unitPriceCents: line.unitPriceCents,
    quantity: line.quantity,
    lineTotalCents: line.unitPriceCents * line.quantity,
  }));
  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return { lines, totalCents };
}
