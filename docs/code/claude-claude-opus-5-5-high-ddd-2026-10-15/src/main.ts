import { AddItemToCart } from "./application/AddItemToCart";
import { RemoveItemFromCart } from "./application/RemoveItemFromCart";
import { ViewCart } from "./application/ViewCart";
import { isCartEvent } from "./domain/cart/CartEvents";
import type { DomainEvent } from "./domain/shared/DomainEvent";
import { ConsoleOutput } from "./infrastructure/ConsoleOutput";
import { InMemoryCartRepository } from "./infrastructure/InMemoryCartRepository";
import { InMemoryEventPublisher } from "./infrastructure/InMemoryEventPublisher";
import { CartPresenter } from "./presentation/CartPresenter";
import type { Output } from "./presentation/Output";

/** Composition root: wires the layers together and runs a sample session. */
export async function main(output: Output = new ConsoleOutput()): Promise<void> {
  const carts = new InMemoryCartRepository();
  const events = new InMemoryEventPublisher();
  events.subscribe((event) => output.writeLine(`  event: ${describe(event)}`));

  const addItem = new AddItemToCart(carts, events);
  const removeItem = new RemoveItemFromCart(carts, events);
  const viewCart = new ViewCart(carts);
  const presenter = new CartPresenter();

  const cartId = "cart-1";
  const show = async (): Promise<void> => {
    for (const line of presenter.present(await viewCart.execute({ cartId }))) {
      output.writeLine(line);
    }
  };
  const attempt = async (label: string, action: () => Promise<unknown>): Promise<void> => {
    output.writeLine(label);
    try {
      await action();
    } catch (error) {
      output.writeLine(`  rejected: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  await attempt("Add 2 x Coffee mug", () =>
    addItem.execute({
      cartId,
      productId: "mug-001",
      productName: "Coffee mug",
      unitPriceCents: 1250,
      currency: "USD",
      quantity: 2,
    }),
  );
  await attempt("Add 1 x Notebook", () =>
    addItem.execute({
      cartId,
      productId: "nb-042",
      productName: "Notebook",
      unitPriceCents: 499,
      currency: "USD",
      quantity: 1,
    }),
  );
  await attempt("Add 1 more Coffee mug", () =>
    addItem.execute({
      cartId,
      productId: "mug-001",
      productName: "Coffee mug",
      unitPriceCents: 1250,
      currency: "USD",
      quantity: 1,
    }),
  );
  await show();

  await attempt("Remove Coffee mug", () => removeItem.execute({ cartId, productId: "mug-001" }));
  await show();

  await attempt("Remove a product that is not in the cart", () =>
    removeItem.execute({ cartId, productId: "pen-007" }),
  );
  await attempt("Add 0 x Pen", () =>
    addItem.execute({
      cartId,
      productId: "pen-007",
      productName: "Pen",
      unitPriceCents: 150,
      currency: "USD",
      quantity: 0,
    }),
  );
  await show();
}

function describe(event: DomainEvent): string {
  if (!isCartEvent(event)) {
    return event.type;
  }
  switch (event.type) {
    case "ItemAddedToCart":
      return `${event.quantityAdded} x ${event.productId} added, now ${event.newQuantity}`;
    case "ItemRemovedFromCart":
      return `${event.productId} removed`;
  }
}

await main();
