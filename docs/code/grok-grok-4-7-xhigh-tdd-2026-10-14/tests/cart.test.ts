import { addItem, createCart, removeItem, showItems } from "../cart";
import type { Item } from "../item";
import { expectEqual, type TestCase } from "./assert";

const pen: Item = { id: "pen", name: "Pen" };
const notebook: Item = { id: "notebook", name: "Notebook" };
const marker: Item = { id: "marker", name: "Marker" };

export const cartTests: readonly TestCase[] = [
  {
    name: "a new cart shows no items",
    run() {
      expectEqual(showItems(createCart()), []);
    },
  },
  {
    name: "adding an item shows that item",
    run() {
      const cart = addItem(createCart(), pen);
      expectEqual(showItems(cart), [pen]);
    },
  },
  {
    name: "adding two items shows both in the order they were added",
    run() {
      const cart = addItem(addItem(createCart(), pen), notebook);
      expectEqual(showItems(cart), [pen, notebook]);
    },
  },
  {
    name: "adding an item leaves the previous cart unchanged",
    run() {
      const cart = addItem(createCart(), pen);
      addItem(cart, notebook);
      expectEqual(showItems(cart), [pen]);
    },
  },
  {
    name: "adding an item keeps the stored name when the caller changes the input",
    run() {
      const input = { id: "pen", name: "Pen" };
      const cart = addItem(createCart(), input);
      input.name = "Marker";
      expectEqual(showItems(cart), [pen]);
    },
  },
  {
    name: "showing items returns a list the caller can extend without changing the cart",
    run() {
      const cart = addItem(createCart(), pen);
      const shown = showItems(cart) as Item[];
      shown.push(notebook);
      expectEqual(showItems(cart), [pen]);
    },
  },
  {
    name: "showing items returns item data the caller can change without changing the cart",
    run() {
      const cart = addItem(createCart(), pen);
      const shown = showItems(cart) as Array<{ id: string; name: string }>;
      const first = shown[0];
      if (first === undefined) {
        throw new Error("expected the pen to be shown");
      }
      first.name = "Marker";
      expectEqual(showItems(cart), [pen]);
    },
  },
  {
    name: "removing the middle item leaves the other items in order",
    run() {
      const cart = addItem(addItem(addItem(createCart(), pen), notebook), marker);
      const next = removeItem(cart, notebook.id);
      expectEqual(showItems(next), [pen, marker]);
    },
  },
  {
    name: "removing the last item keeps the earlier items",
    run() {
      const cart = addItem(addItem(createCart(), pen), notebook);
      const next = removeItem(cart, notebook.id);
      expectEqual(showItems(next), [pen]);
    },
  },
  {
    name: "removing the only item shows an empty cart",
    run() {
      const cart = addItem(createCart(), pen);
      const next = removeItem(cart, pen.id);
      expectEqual(showItems(next), []);
    },
  },
  {
    name: "removing an id that is not in the cart keeps the shown items",
    run() {
      const cart = addItem(createCart(), pen);
      const next = removeItem(cart, "missing");
      expectEqual(showItems(next), [pen]);
    },
  },
  {
    name: "removing an item from an empty cart shows no items",
    run() {
      const next = removeItem(createCart(), pen.id);
      expectEqual(showItems(next), []);
    },
  },
  {
    name: "removing an item leaves the previous cart unchanged",
    run() {
      const cart = addItem(addItem(createCart(), pen), notebook);
      removeItem(cart, pen.id);
      expectEqual(showItems(cart), [pen, notebook]);
    },
  },
  {
    name: "removing an id drops only the first item with that id",
    run() {
      const blue = { id: "pen", name: "Blue pen" };
      const red = { id: "pen", name: "Red pen" };
      const cart = addItem(addItem(createCart(), blue), red);
      const next = removeItem(cart, "pen");
      expectEqual(showItems(next), [red]);
    },
  },
];
