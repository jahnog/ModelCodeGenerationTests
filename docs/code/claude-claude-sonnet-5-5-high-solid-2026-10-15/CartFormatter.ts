import type { CartItem } from "./CartItem";

export interface CartFormatter {
  format(items: readonly CartItem[]): string;
}
