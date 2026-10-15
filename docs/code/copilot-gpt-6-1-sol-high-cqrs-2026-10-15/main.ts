import { InMemoryCartStore } from "./cart-store";
import { AddItemHandler, RemoveItemHandler } from "./commands";
import { GetCartItemsHandler } from "./queries";

export function main(): void {
  const store = new InMemoryCartStore();
  const addItem = new AddItemHandler(store);
  const removeItem = new RemoveItemHandler(store);
  const getCartItems = new GetCartItemsHandler(store);

  addItem.execute({
    id: "apple",
    name: "Apple",
    unitPriceCents: 150,
    quantity: 2,
  });
  addItem.execute({
    id: "bread",
    name: "Bread",
    unitPriceCents: 300,
  });
  console.log("Shopping cart:", getCartItems.execute());

  removeItem.execute({ id: "apple" });
  console.log("Shopping cart after removing apples:", getCartItems.execute());
}

main();
