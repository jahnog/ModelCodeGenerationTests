import { addItem, removeItem, showItems, type Cart } from "../cart";

const empty: Cart = { items: [] };
const added = addItem(empty, { id: "1", name: "pen" });

export const shown = showItems(added);
export const removed = removeItem(added, "1");
