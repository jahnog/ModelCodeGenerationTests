import type { CartRepository } from "../domain/CartRepository";
import { type CartDto, toCartDto } from "./CartDto";
import { loadCart } from "./loadCart";

export interface RemoveItemFromCartCommand {
  readonly cartId: string;
  readonly productId: string;
}

export class RemoveItemFromCart {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  async execute(command: RemoveItemFromCartCommand): Promise<CartDto> {
    const cart = await loadCart(this.repository, command.cartId);
    cart.removeItem(command.productId);
    await this.repository.save(cart);
    return toCartDto(cart);
  }
}
