import type { AddedItem, CartContents, RemovedItem } from "../application/cart-dto";

export class CartPresenter {
  presentAdded(item: AddedItem): string {
    return `Added ${item.name}. Quantity in cart: ${item.quantity}.`;
  }

  presentRemoved(item: RemovedItem): string {
    return `Removed ${item.name}.`;
  }

  presentContents(contents: CartContents): string {
    if (contents.lines.length === 0) {
      return "Shopping cart is empty.";
    }
    const lines = contents.lines.map((line) => {
      const unit = formatCents(line.unitPriceCents);
      const lineTotal = formatCents(line.lineTotalCents);
      return `- ${line.name}: ${line.quantity} x ${unit} = ${lineTotal}`;
    });
    return [`Shopping cart:`, ...lines, `Total: ${formatCents(contents.totalCents)}`].join("\n");
  }

  presentError(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }
    return "Unexpected error.";
  }
}

function formatCents(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const remainder = Math.abs(cents % 100);
  return `$${dollars}.${remainder.toString().padStart(2, "0")}`;
}
