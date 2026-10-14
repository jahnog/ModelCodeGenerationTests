import { CartProblem, type CartError } from "./cart-error";
import {
  createItem,
  parseItemId,
  replaceQuantity,
  type Item,
  type ItemDraft,
  type ItemId,
} from "./item";
import { addQuantities, formatCents, sumCents, zeroCents, type Cents } from "./money";
import { err, ok, type Result } from "./result";

export interface CartSnapshot {
  readonly lines: readonly Item[];
  readonly totalCents: Cents;
  readonly text: string;
}

/**
 * Immutable shopping cart. Adding and removing return a new cart.
 * The same item id increases quantity when the name and unit price match.
 */
export class ShoppingCart {
  readonly #lines: ReadonlyMap<ItemId, Item>;
  readonly #totalCents: Cents;

  private constructor(lines: ReadonlyMap<ItemId, Item>, totalCents: Cents) {
    this.#lines = lines;
    this.#totalCents = totalCents;
  }

  static empty(): ShoppingCart {
    return new ShoppingCart(new Map<ItemId, Item>(), zeroCents);
  }

  /**
   * Adds an item. A matching id, name, and unit price increases the quantity.
   * Returns a new cart and leaves this cart unchanged.
   */
  addItem(draft: ItemDraft): Result<ShoppingCart, CartError> {
    const created = createItem(draft);
    if (!created.ok) {
      return created;
    }
    const incoming = created.value;
    const existing = this.#lines.get(incoming.id);
    if (existing === undefined) {
      return this.#place(incoming);
    }
    const merged = mergeLine(existing, incoming);
    if (!merged.ok) {
      return merged;
    }
    return this.#place(merged.value);
  }

  /** Lists items in insertion order, with each line total and the cart total. */
  showItems(): CartSnapshot {
    const lines: readonly Item[] = Object.freeze([...this.#lines.values()]);
    return {
      lines,
      totalCents: this.#totalCents,
      text: formatCart(lines, this.#totalCents),
    };
  }

  /** Removes the whole line for an item id. Returns a new cart. */
  removeItem(id: string): Result<ShoppingCart, CartError> {
    const parsed = parseItemId(id);
    if (!parsed.ok) {
      return parsed;
    }
    if (!this.#lines.has(parsed.value)) {
      return err({ kind: CartProblem.notFound, id: parsed.value });
    }
    const lines = new Map(this.#lines);
    lines.delete(parsed.value);
    return this.#fromLines(lines);
  }

  #place(item: Item): Result<ShoppingCart, CartError> {
    const lines = new Map(this.#lines);
    lines.set(item.id, item);
    return this.#fromLines(lines);
  }

  #fromLines(lines: ReadonlyMap<ItemId, Item>): Result<ShoppingCart, CartError> {
    const totals: Cents[] = [];
    for (const line of lines.values()) {
      totals.push(line.lineTotalCents);
    }
    const total = sumCents(totals);
    if (!total.ok) {
      return total;
    }
    return ok(new ShoppingCart(lines, total.value));
  }
}

function mergeLine(existing: Item, incoming: Item): Result<Item, CartError> {
  if (existing.name !== incoming.name || existing.unitPriceCents !== incoming.unitPriceCents) {
    return err({ kind: CartProblem.identityConflict, id: existing.id });
  }
  const combined = addQuantities(existing.quantity, incoming.quantity);
  if (!combined.ok) {
    return combined;
  }
  return replaceQuantity(existing, combined.value);
}

function formatCart(lines: readonly Item[], totalCents: Cents): string {
  if (lines.length === 0) {
    return "The shopping cart is empty.";
  }
  const rows = lines.map((line) => {
    const unit = formatCents(line.unitPriceCents);
    const total = formatCents(line.lineTotalCents);
    return `${line.name} (${line.id}) x ${line.quantity} @ ${unit} = ${total}`;
  });
  return `${rows.join("\n")}\nTotal: ${formatCents(totalCents)}`;
}
