import { Output } from "../adapters/CartController";

declare const console: { log(message: string): void };

export class ConsoleOutput implements Output {
  write(text: string): void {
    console.log(text);
  }
}
