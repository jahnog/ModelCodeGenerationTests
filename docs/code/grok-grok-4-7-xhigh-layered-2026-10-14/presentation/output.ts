export interface Output {
  writeLine(text: string): void;
}

export const consoleOutput: Output = {
  writeLine(text: string): void {
    console.log(text);
  },
};
