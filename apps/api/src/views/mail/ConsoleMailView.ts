import type { LetterViewModel, MailView } from "../../presenters/acceptance-letter/MailView.js";

export class ConsoleMailView implements MailView {
  static lastLetter: LetterViewModel | null = null;
  static lastVerificationUrl: string | null = null;

  async render(model: LetterViewModel): Promise<void> {
    ConsoleMailView.lastLetter = model;
    const match = model.html.match(/href="([^"]+)"/);
    ConsoleMailView.lastVerificationUrl = match?.[1] ?? null;

    console.log("\n--- Carta de Aceptación (modo consola) ---");
    console.log(`Para: ${model.to}`);
    console.log(`Asunto: ${model.subject}`);
    if (ConsoleMailView.lastVerificationUrl) {
      console.log(`Link de verificación: ${ConsoleMailView.lastVerificationUrl}`);
    }
    console.log("------------------------------------------\n");
  }

  static reset(): void {
    ConsoleMailView.lastLetter = null;
    ConsoleMailView.lastVerificationUrl = null;
  }
}
