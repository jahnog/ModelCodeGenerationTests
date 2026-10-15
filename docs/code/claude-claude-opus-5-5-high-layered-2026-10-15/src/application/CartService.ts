import { CartItem, type Cart, type CartRepository } from "../domain";
import type { AddItemRequest, CartDto, CartItemDto } from "./dto";

/** Use cases for the shopping cart. Coordinates the domain and the repository port. */
export class CartService {
  constructor(private readonly repository: CartRepository) {}

  addItem(request: AddItemRequest): CartItemDto {
    const cart = this.repository.load();
    const added = cart.add(CartItem.create(request));
    this.repository.save(cart);
    return toItemDto(added);
  }

  listItems(): CartDto {
    return toCartDto(this.repository.load());
  }

  removeItem(itemId: string): CartItemDto {
    const cart = this.repository.load();
    const removed = cart.remove(itemId.trim());
    this.repository.save(cart);
    return toItemDto(removed);
  }
}

function toItemDto(item: CartItem): CartItemDto {
  return { ...item.toProps(), subtotalCents: item.subtotalCents };
}

function toCartDto(cart: Cart): CartDto {
  return { items: cart.getItems().map(toItemDto), totalCents: cart.totalCents };
}
