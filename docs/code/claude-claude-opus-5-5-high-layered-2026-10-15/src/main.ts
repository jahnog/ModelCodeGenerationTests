import { CartService } from "./application";
import { InMemoryCartRepository } from "./infrastructure";
import { CartController, type Output } from "./presentation";

// Composition root: the only place that knows every layer and wires them together.

interface ConsoleLike {
  log(message: string): void;
}

const consoleOutput: Output = {
  writeLine(text: string): void {
    (globalThis as unknown as { console: ConsoleLike }).console.log(text);
  },
};

export function createCartApp(output: Output = consoleOutput): CartController {
  const repository = new InMemoryCartRepository();
  const service = new CartService(repository);
  return new CartController(service, output);
}

export function runDemo(output: Output = consoleOutput): void {
  const app = createCartApp(output);
  const commands = [
    "help",
    "list",
    "add A1 2.50 3 Green apple",
    "add B7 1.99 1 Whole wheat bread",
    "add A1 2.50 2 Green apple",
    "list",
    "remove B7",
    "list",
    "remove B7",
  ];
  for (const command of commands) {
    output.writeLine(`\n> ${command}`);
    app.execute(command);
  }
}

runDemo();
