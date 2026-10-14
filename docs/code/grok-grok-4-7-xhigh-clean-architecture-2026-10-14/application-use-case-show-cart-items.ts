// Use case. Reads the cart through the repository port and returns lines for a presenter.

import type { CartRepository } from "./application-port-cart-repository";
import { toShownCart, type ShownCart } from "./application-shown-cart";

export interface ShowCartItemsInput {
  execute(): ShownCart;
}

export class ShowCartItemsInteractor implements ShowCartItemsInput {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  execute(): ShownCart {
    return toShownCart(this.repository.load());
  }
}
