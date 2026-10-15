import type { CartItem } from "../domain/cartItem";

/** Data layer contract: the service depends on this, not on a concrete store. */
export interface CartRepository {
  findAll(): readonly CartItem[];
  findById(id: string): CartItem | undefined;
  save(item: CartItem): void;
  deleteById(id: string): boolean;
}
