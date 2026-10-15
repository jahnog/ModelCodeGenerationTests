import type { OutputPort } from "../application/OutputPort";

interface ConsoleLike {
  log(message: string): void;
}

/**
 * Reads `console` off globalThis so the code typechecks whether or not the
 * DOM or Node type libraries are loaded.
 */
export class ConsoleOutput implements OutputPort {
  writeLine(text: string): void {
    const { console } = globalThis as unknown as { console?: ConsoleLike };
    console?.log(text);
  }
}
