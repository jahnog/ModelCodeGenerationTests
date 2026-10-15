import { CartCommandLineAdapter } from "./adapters/in/cli/CartCommandLineAdapter";
import { InMemoryCartRepository } from "./adapters/out/persistence/InMemoryCartRepository";
import { CartService } from "./application/services/CartService";

/** Composition root: the only place that knows about concrete adapters. */
export function createCartApp(cartId: string): CartCommandLineAdapter {
  const service = new CartService(new InMemoryCartRepository());
  return new CartCommandLineAdapter(cartId, service, service, service);
}

export const DEMO_COMMANDS: readonly string[] = [
  "show",
  "add apple 0.50 3 Green apple",
  "add bread 2.25 1 Sourdough bread",
  "add apple 0.50 2 Green apple",
  "show",
  "remove apple",
  "remove banana",
  "show",
];

// The program may not import Node built-ins, and the active lib may not declare `console`,
// so read it from globalThis through a minimal structural type.
const output = (
  globalThis as unknown as {
    console: { log(message: string): void; error(message: string): void };
  }
).console;

export async function runDemo(write: (text: string) => void): Promise<void> {
  const app = createCartApp("demo-cart");
  for (const command of DEMO_COMMANDS) {
    write(`> ${command}`);
    write(await app.execute(command));
    write("");
  }
}

runDemo((text) => output.log(text)).catch((error: unknown) => {
  output.error(`Unexpected failure: ${String(error)}`);
});
