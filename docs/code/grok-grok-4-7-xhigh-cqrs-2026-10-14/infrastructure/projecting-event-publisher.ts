import { CartProjector } from "../read-model/cart-projector";
import type { CartEvent } from "../write-model/cart-event";
import type { EventPublisher } from "../write-model/event-publisher";

export class ProjectingEventPublisher implements EventPublisher {
  private readonly projector: CartProjector;

  constructor(projector: CartProjector) {
    this.projector = projector;
  }

  publish(events: readonly CartEvent[]): void {
    this.projector.project(events);
  }
}
