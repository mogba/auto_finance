import { createInterface } from "readline";

export class ReadlineInterface {
  private readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  openQuestion(prompt: string): Promise<string>{
    return new Promise((resolve) => {
      this.readlineInterface.question(prompt, resolve);
    });
  };

  closeQuestion() {
    this.readlineInterface.close();
  }
}
