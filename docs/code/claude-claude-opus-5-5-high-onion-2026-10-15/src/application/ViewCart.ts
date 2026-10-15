import type { CartRepository } from "../domain/CartRepository";
import { type CartDto, toCartDto } from "./CartDto";
import { loadCart } from "./loadCart";

export interface ViewCartQuery {
  readonly cartId: string;
}

export class ViewCart {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  async execute(query: ViewCartQuery): Promise<CartDto> {
    return toCartDto(await loadCart(this.repository, query.cartId));
  }
}
