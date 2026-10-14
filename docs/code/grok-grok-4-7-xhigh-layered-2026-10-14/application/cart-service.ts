import { lineTotalCents } from "../domain/item";
import type { CartRepository } from "../infrastructure/cart-repository";
import type { AddItemRequest, AddedItem, CartContents, RemovedItem } from "./cart-dto";

export class CartService {
  readonly #repository: CartRepository;

  constructor(repository: CartRepository) {
    this.#repository = repository;
  }

  addItem(request: AddItemRequest): AddedItem {
    const cart = this.#repository.load();
    const stored = cart.addItem(request);
    this.#repository.save(cart);
    return {
      id: stored.id,
      name: stored.name,
      quantity: stored.quantity,
    };
  }

  showItems(): CartContents {
    const cart = this.#repository.load();
    const lines = cart.listItems().map((item) => {
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: lineTotalCents(item),
      };
    });
    return {
      lines,
      totalCents: cart.totalCents(),
    };
  }

  removeItem(id: string): RemovedItem {
    const cart = this.#repository.load();
    const removed = cart.removeItem(id);
    this.#repository.save(cart);
    return {
      id: removed.id,
      name: removed.name,
    };
  }
}
