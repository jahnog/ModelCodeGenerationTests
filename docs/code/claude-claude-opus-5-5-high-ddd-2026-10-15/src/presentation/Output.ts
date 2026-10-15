/** Where the presentation layer writes text for the user. */
export interface Output {
  writeLine(line: string): void;
}
