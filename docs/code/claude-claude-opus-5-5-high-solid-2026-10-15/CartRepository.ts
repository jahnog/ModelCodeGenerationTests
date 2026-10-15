import type { CartItem } from "./CartItem";

/** Storage abstraction for cart items (Dependency Inversion: the service depends on this, not on a concrete store). */
export interface CartRepository {
  findById(id: string): CartItem | undefined;
  findAll(): readonly CartItem[];
  save(item: CartItem): void;
  delete(id: string): boolean;
}
