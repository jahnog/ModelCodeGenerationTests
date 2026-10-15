import { CartItem } from "../domain/CartItem";
import type { CartRepository } from "../domain/CartRepository";
import { type CartDto, toCartDto } from "./CartDto";
import { loadCart } from "./loadCart";

export interface AddItemToCartCommand {
  readonly cartId: string;
  readonly productId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export class AddItemToCart {
  private readonly repository: CartRepository;

  constructor(repository: CartRepository) {
    this.repository = repository;
  }

  async execute(command: AddItemToCartCommand): Promise<CartDto> {
    const cart = await loadCart(this.repository, command.cartId);
    cart.addItem(
      CartItem.create({
        productId: command.productId,
        name: command.name,
        unitPriceCents: command.unitPriceCents,
        quantity: command.quantity,
      }),
    );
    await this.repository.save(cart);
    return toCartDto(cart);
  }
}
