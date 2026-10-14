import { CartService } from "./application/cart-service";
import { InMemoryCartRepository } from "./infrastructure/in-memory-cart-repository";
import { CartController } from "./presentation/cart-controller";
import { CartPresenter } from "./presentation/cart-presenter";
import { consoleOutput, type Output } from "./presentation/output";

// Composition root. Presentation calls application. Application calls domain
// and the infrastructure repository. Domain does not import another layer.
export function createCartProgram(output: Output = consoleOutput): CartController {
  const repository = new InMemoryCartRepository();
  const service = new CartService(repository);
  const presenter = new CartPresenter();
  return new CartController(service, presenter, output);
}

export function main(output: Output = consoleOutput): void {
  const cart = createCartProgram(output);
  cart.showItems();
  cart.addItem({ id: "milk", name: "Milk", unitPriceCents: 150, quantity: 1 });
  cart.addItem({ id: "milk", name: "Milk", unitPriceCents: 150, quantity: 1 });
  cart.addItem({ id: "bread", name: "Bread", unitPriceCents: 200, quantity: 1 });
  cart.showItems();
  cart.removeItem("milk");
  cart.showItems();
}

main();
