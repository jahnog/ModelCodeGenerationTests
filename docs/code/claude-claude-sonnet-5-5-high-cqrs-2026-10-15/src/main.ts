import { CartError } from "./domain/cart";
import { EventBus } from "./infrastructure/eventBus";
import { InMemoryEventStore } from "./infrastructure/eventStore";
import { formatCart } from "./formatCart";
import { CartReadModel } from "./read/cartReadModel";
import { QueryBus } from "./read/queryBus";
import { CommandBus } from "./write/commandBus";
import { CartCommandHandlers } from "./write/commandHandlers";

export function createApp() {
  const eventStore = new InMemoryEventStore();
  const eventBus = new EventBus();
  const readModel = new CartReadModel();
  eventBus.subscribe((event) => readModel.project(event));

  const handlers = new CartCommandHandlers(eventStore, eventBus, () => new Date().toISOString());
  return { commands: new CommandBus(handlers), queries: new QueryBus(readModel) };
}

export function runDemo(): void {
  const { commands, queries } = createApp();
  const cartId = "cart-1";
  const show = (): void => console.log(formatCart(queries.ask({ type: "GetCartItems", cartId })));

  commands.dispatch({
    type: "AddItemToCart",
    cartId,
    productId: "book",
    name: "TypeScript Book",
    unitPriceCents: 3999,
    quantity: 1,
  });
  commands.dispatch({
    type: "AddItemToCart",
    cartId,
    productId: "pen",
    name: "Pen",
    unitPriceCents: 150,
    quantity: 3,
  });
  console.log("After adding two items:");
  show();

  commands.dispatch({ type: "RemoveItemFromCart", cartId, productId: "book" });
  console.log("After removing the book:");
  show();

  try {
    commands.dispatch({ type: "RemoveItemFromCart", cartId, productId: "book" });
  } catch (error) {
    if (error instanceof CartError) {
      console.log(`Rejected: ${error.message}`);
    } else {
      throw error;
    }
  }
}

runDemo();
