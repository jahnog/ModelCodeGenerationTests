/** Where the outer layers write text for the user. */
export interface OutputPort {
  writeLine(text: string): void;
}
