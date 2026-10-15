import type { CartItem } from "./CartItem";

export interface CartReader {
  findAll(): readonly CartItem[];
  findById(id: string): CartItem | undefined;
}

export interface CartWriter {
  save(item: CartItem): void;
  deleteById(id: string): boolean;
}

export interface CartRepository extends CartReader, CartWriter {}
