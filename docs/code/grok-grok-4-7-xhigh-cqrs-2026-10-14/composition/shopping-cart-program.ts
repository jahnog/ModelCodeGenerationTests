import type { CommandAcknowledgement } from "../command/cart-command";
import type { CommandBus } from "../command/command-bus";
import { AddItemHandler } from "../handler/add-item-handler";
import { RemoveItemHandler } from "../handler/remove-item-handler";
import { ShowCartItemsHandler } from "../handler/show-cart-items-handler";
import { InMemoryCommandBus } from "../infrastructure/in-memory-command-bus";
import { InMemoryCartReadStore } from "../infrastructure/in-memory-cart-read-store";
import { InMemoryCartWriteStore } from "../infrastructure/in-memory-cart-write-store";
import { InMemoryQueryBus } from "../infrastructure/in-memory-query-bus";
import { ProjectingEventPublisher } from "../infrastructure/projecting-event-publisher";
import type { QueryBus } from "../query/query-bus";
import { CartProjector } from "../read-model/cart-projector";
import type { ShownCart } from "../read-model/shown-cart";

export const defaultCartId = "cart";

export interface ItemToAdd {
  readonly itemId: string;
  readonly name: string;
  readonly unitPriceCents: number;
  readonly quantity: number;
}

export class ShoppingCartProgram {
  private readonly commands: CommandBus;
  private readonly queries: QueryBus;
  private readonly cartId: string;

  constructor(commands: CommandBus, queries: QueryBus, cartId: string) {
    this.commands = commands;
    this.queries = queries;
    this.cartId = cartId;
  }

  addItem(item: ItemToAdd): CommandAcknowledgement {
    return this.commands.dispatch({
      kind: "AddItem",
      cartId: this.cartId,
      itemId: item.itemId,
      name: item.name,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    });
  }

  removeItem(itemId: string): CommandAcknowledgement {
    return this.commands.dispatch({
      kind: "RemoveItem",
      cartId: this.cartId,
      itemId,
    });
  }

  showItems(): ShownCart {
    return this.queries.ask({
      kind: "ShowCartItems",
      cartId: this.cartId,
    });
  }
}

export function createShoppingCartProgram(cartId: string = defaultCartId): ShoppingCartProgram {
  if (cartId.trim() === "") {
    throw new Error("A shopping cart id is required.");
  }

  const writeStore = new InMemoryCartWriteStore();
  const readStore = new InMemoryCartReadStore();
  const publisher = new ProjectingEventPublisher(new CartProjector(readStore));
  const addItemHandler = new AddItemHandler(writeStore, publisher);
  const removeItemHandler = new RemoveItemHandler(writeStore, publisher);
  const showCartItemsHandler = new ShowCartItemsHandler(readStore);

  const commands = new InMemoryCommandBus();
  commands.register(addItemHandler.kind, (command) => addItemHandler.handle(command));
  commands.register(removeItemHandler.kind, (command) => removeItemHandler.handle(command));

  const queries = new InMemoryQueryBus();
  queries.registerShowCartItems((query) => showCartItemsHandler.handle(query));

  return new ShoppingCartProgram(commands, queries, cartId);
}
