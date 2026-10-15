import { EventBus } from "./event-bus";
import { ShoppingCart, type CartEvents } from "./shopping-cart";

export function main(): void {
  const events = new EventBus<CartEvents>();
  const cart = new ShoppingCart(events);
  const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

  events.on("cart:item-added", (item) => {
    console.log(`Added ${item.name}; quantity in cart: ${item.quantity}.`);
  });
  events.on("cart:item-removed", (item) => {
    console.log(`Removed ${item.name} from the cart.`);
  });
  events.on("cart:items-shown", ({ items, totalQuantity, totalCents }) => {
    console.log("\nShopping cart:");
    if (items.length === 0) {
      console.log("(empty)");
    }
    for (const item of items) {
      console.log(
        `${item.id}: ${item.name} x ${item.quantity} = ${formatPrice(item.unitPriceCents * item.quantity)}`,
      );
    }
    console.log(`Total: ${totalQuantity} item(s), ${formatPrice(totalCents)}`);
  });

  try {
    events.emit("cart:add-item", {
      id: "apple",
      name: "Apple",
      unitPriceCents: 150,
      quantity: 2,
    });
    events.emit("cart:add-item", {
      id: "bread",
      name: "Bread",
      unitPriceCents: 325,
      quantity: 1,
    });
    events.emit("cart:show-items", undefined);
    events.emit("cart:remove-item", { id: "apple" });
    events.emit("cart:show-items", undefined);
  } finally {
    cart.dispose();
  }
}

main();
