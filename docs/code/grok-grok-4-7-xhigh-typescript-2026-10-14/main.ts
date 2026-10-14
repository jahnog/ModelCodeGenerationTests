import { describeCartError } from "./cart-error";
import { type ItemDraft } from "./item";
import { ShoppingCart } from "./shopping-cart";

const additions = [
  { id: "milk", name: "Milk", unitPriceCents: 199, quantity: 2 },
  { id: "milk", name: "Milk", unitPriceCents: 199, quantity: 1 },
  { id: "bread", name: "Bread", unitPriceCents: 350, quantity: 1 },
] as const satisfies readonly ItemDraft[];

/** Adds items, shows the cart, removes an item, and shows the cart again. */
export function main(): readonly string[] {
  const transcript: string[] = [];
  let cart = ShoppingCart.empty();
  transcript.push(cart.showItems().text);

  for (const draft of additions) {
    const added = cart.addItem(draft);
    if (!added.ok) {
      transcript.push(describeCartError(added.error));
      return transcript;
    }
    cart = added.value;
    transcript.push(`Added ${draft.name} x ${draft.quantity}.`);
  }

  transcript.push(cart.showItems().text);

  const removed = cart.removeItem("milk");
  if (!removed.ok) {
    transcript.push(describeCartError(removed.error));
    return transcript;
  }
  cart = removed.value;
  transcript.push("Removed milk.");
  transcript.push(cart.showItems().text);
  return transcript;
}

console.log(main().join("\n"));
