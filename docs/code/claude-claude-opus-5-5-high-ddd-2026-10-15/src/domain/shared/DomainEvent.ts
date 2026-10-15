/** Something that happened in the domain that other parts of the system may care about. */
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}
