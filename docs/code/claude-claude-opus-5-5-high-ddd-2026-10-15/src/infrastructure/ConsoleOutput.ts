import type { Output } from "../presentation/Output";

interface LogSink {
  log(message: string): void;
}

/**
 * Writes lines to the global console. The console is read from globalThis so the
 * program needs neither Node type definitions nor the DOM library.
 */
export class ConsoleOutput implements Output {
  private readonly sink: LogSink;

  constructor() {
    const candidate = (globalThis as unknown as { console?: LogSink }).console;
    this.sink = candidate ?? { log: () => {} };
  }

  writeLine(line: string): void {
    this.sink.log(line);
  }
}
