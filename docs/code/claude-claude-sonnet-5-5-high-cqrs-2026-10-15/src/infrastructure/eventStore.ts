import type { CartEvent, CartId } from "../domain/events";

export class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConcurrencyError";
  }
}

export interface EventStore {
  load(cartId: CartId): readonly CartEvent[];
  append(cartId: CartId, expectedVersion: number, events: readonly CartEvent[]): void;
}

export class InMemoryEventStore implements EventStore {
  private readonly streams = new Map<CartId, CartEvent[]>();

  load(cartId: CartId): readonly CartEvent[] {
    return [...(this.streams.get(cartId) ?? [])];
  }

  append(cartId: CartId, expectedVersion: number, events: readonly CartEvent[]): void {
    const stream = this.streams.get(cartId) ?? [];
    if (stream.length !== expectedVersion) {
      throw new ConcurrencyError(
        `Cart "${cartId}" is at version ${stream.length}, expected ${expectedVersion}.`,
      );
    }
    this.streams.set(cartId, [...stream, ...events]);
  }
}
