import { CartService } from "./application/cartService";
import { CartCli } from "./adapters/in/cartCli";
import { InMemoryCartRepository } from "./adapters/out/inMemoryCartRepository";

// Declared locally so the program needs neither Node types nor the DOM lib.
declare const console: { log(message: string): void };

/** Composition root: the only place that knows every concrete adapter. */
export const main = async (): Promise<void> => {
  const repository = new InMemoryCartRepository();
  const service = new CartService(repository);
  const cli = new CartCli(service, "demo-cart", (line) => console.log(line));

  const script = [
    "list",
    "add apple Green_apple 0.50 4",
    "add milk Whole_milk 1.20",
    "add apple Green_apple 0.50 2",
    "list",
    "remove apple",
    "remove bread",
    "add pear Pear abc",
    "list",
  ];
  for (const command of script) {
    await cli.run(command);
  }
};

await main();
