/** Where text goes (Dependency Inversion: views write here, not to the console directly). */
export interface Output {
  write(text: string): void;
}

export class ConsoleOutput implements Output {
  write(text: string): void {
    console.log(text);
  }
}
