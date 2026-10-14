import { DomainError } from "../../domain/error/domain-error";
import type { CartLine } from "../../domain/model/cart-line";
import type { CartSummary } from "../../domain/service/cart-summary";
import type { CartFailure, CartItemData, CartView } from "../dto/cart-view";

export function toCartItemData(line: CartLine): CartItemData {
  return {
    productId: line.productId.value,
    name: line.name.value,
    unitPriceCents: line.unitPrice.cents,
    quantity: line.quantity.value,
    lineTotalCents: line.lineTotalCents(),
  };
}

export function toCartView(summary: CartSummary): CartView {
  return {
    ok: true,
    items: summary.lines.map(toCartItemData),
    itemCount: summary.itemCount,
    totalCents: summary.totalCents,
  };
}

export function toFailure(error: unknown): CartFailure {
  if (error instanceof DomainError) {
    return { ok: false, code: error.code, message: error.message };
  }
  throw error;
}
