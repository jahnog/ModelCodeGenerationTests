import type { ShownCart } from "../read-model/shown-cart";
import type { ShowCartItemsQuery } from "./show-cart-items-query";

export interface QueryBus {
  ask(query: ShowCartItemsQuery): ShownCart;
}
