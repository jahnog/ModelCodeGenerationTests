import type { Output } from "./Output";

declare const console: { log(message: string): void };

export class ConsoleOutput implements Output {
  writeLine(text: string): void {
    console.log(text);
  }
}
