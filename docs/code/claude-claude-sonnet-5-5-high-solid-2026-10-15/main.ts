import { AddItemToCart } from "./AddItemToCart";
import { createCartItem } from "./CartItem";
import { ConsoleOutput } from "./ConsoleOutput";
import { InMemoryCartRepository } from "./InMemoryCartRepository";
import { RemoveItemFromCart } from "./RemoveItemFromCart";
import { ShowCartItems } from "./ShowCartItems";
import { TextCartFormatter } from "./TextCartFormatter";

export function main(): void {
  const repository = new InMemoryCartRepository();
  const formatter = new TextCartFormatter();
  const output = new ConsoleOutput();

  const addItem = new AddItemToCart(repository, repository);
  const showItems = new ShowCartItems(repository);
  const removeItem = new RemoveItemFromCart(repository);

  const show = (title: string): void => {
    output.writeLine(`${title}\n${formatter.format(showItems.execute())}\n`);
  };

  show("Empty cart:");

  addItem.execute(createCartItem("apple", "Apple", 50, 3));
  addItem.execute(createCartItem("bread", "Bread", 250, 1));
  addItem.execute(createCartItem("apple", "Apple", 50, 2));
  show("After adding items:");

  const removed = removeItem.execute("bread");
  output.writeLine(removed ? "Removed 'bread'." : "'bread' was not in the cart.");
  const missing = removeItem.execute("milk");
  output.writeLine(missing ? "Removed 'milk'." : "'milk' was not in the cart.");
  show("\nAfter removing items:");
}

main();
