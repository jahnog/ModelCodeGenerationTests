import { DomainError } from "../error/domain-error";
import { ItemName } from "./item-name";
import { ProductId } from "./product-id";
import { Quantity } from "./quantity";
import { UnitPrice } from "./unit-price";

export class CartLine {
  readonly productId: ProductId;
  readonly name: ItemName;
  readonly unitPrice: UnitPrice;
  readonly quantity: Quantity;

  private constructor(
    productId: ProductId,
    name: ItemName,
    unitPrice: UnitPrice,
    quantity: Quantity,
  ) {
    this.productId = productId;
    this.name = name;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  static create(
    productId: ProductId,
    name: ItemName,
    unitPrice: UnitPrice,
    quantity: Quantity,
  ): CartLine {
    const line = new CartLine(productId, name, unitPrice, quantity);
    line.lineTotalCents();
    return line;
  }

  withAddedQuantity(extra: Quantity): CartLine {
    const line = new CartLine(
      this.productId,
      this.name,
      this.unitPrice,
      Quantity.sum(this.quantity, extra),
    );
    line.lineTotalCents();
    return line;
  }

  lineTotalCents(): number {
    const total = this.unitPrice.cents * this.quantity.value;
    if (!Number.isSafeInteger(total)) {
      throw new DomainError(
        "line-total-overflow",
        "Line total is outside the safe integer range.",
      );
    }
    return total;
  }
}
