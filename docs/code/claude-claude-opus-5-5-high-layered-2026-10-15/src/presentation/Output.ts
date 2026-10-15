/** Where the presentation layer writes text. Lets the UI stay independent of any host API. */
export interface Output {
  writeLine(text: string): void;
}
