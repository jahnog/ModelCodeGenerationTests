import { addItem, createCart, removeItem, showItems } from "./cart";
import type { Item } from "./item";

const pen: Item = { id: "pen", name: "Pen" };
const notebook: Item = { id: "notebook", name: "Notebook" };

export type ShoppingCartProgram = {
  readonly shown: readonly Item[];
  readonly afterRemoval: readonly Item[];
};

export function runShoppingCart(): ShoppingCartProgram {
  const withPen = addItem(createCart(), pen);
  const withBoth = addItem(withPen, notebook);
  const shown = showItems(withBoth);
  const withoutPen = removeItem(withBoth, pen.id);
  return { shown, afterRemoval: showItems(withoutPen) };
}
