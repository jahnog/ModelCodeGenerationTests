import { CartService } from "./cart-service";
import { CartView } from "./cart-view";
import { EventBus } from "./events";

export function runDemo(out: (line: string) => void): void {
  const bus = new EventBus();
  new CartService(bus);
  new CartView(bus, out);

  bus.publish("ShowCartRequested", {});
  bus.publish("AddItemRequested", {
    item: { id: "apple", name: "Apple", priceCents: 50, quantity: 3 },
  });
  bus.publish("AddItemRequested", {
    item: { id: "bread", name: "Bread", priceCents: 275, quantity: 1 },
  });
  bus.publish("AddItemRequested", {
    item: { id: "apple", name: "Apple", priceCents: 50, quantity: 2 },
  });
  bus.publish("ShowCartRequested", {});
  bus.publish("RemoveItemRequested", { itemId: "apple" });
  bus.publish("RemoveItemRequested", { itemId: "milk" });
  bus.publish("ShowCartRequested", {});
}

runDemo((line) => console.log(line));
