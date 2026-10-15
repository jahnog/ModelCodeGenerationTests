export interface Output {
  write(text: string): void;
}

/** The only place that knows the program prints to the console. */
export class ConsoleOutput implements Output {
  write(text: string): void {
    console.log(text);
  }
}
