import type { RegisterElfResponse } from "../../interactors/register-elf/RegisterElfResponse.js";
import { renderAcceptanceLetterHtml } from "./acceptanceLetterTemplate.js";
import { loadInlineEmailAttachments } from "./emailAssets.js";
import type { LetterViewModel, MailView } from "./MailView.js";

export interface AcceptanceLetterPresenterConfig {
  appBaseUrl: string;
  emailFrom: string;
}

export class AcceptanceLetterPresenter {
  constructor(
    private readonly mailView: MailView,
    private readonly config: AcceptanceLetterPresenterConfig,
  ) {}

  async present(response: RegisterElfResponse): Promise<void> {
    if (response.outcome !== "ACCEPTED" || !response.rawVerificationToken) {
      return;
    }

    const verificationUrl = `${this.config.appBaseUrl}/verificar?token=${encodeURIComponent(response.rawVerificationToken)}`;
    const displayName = response.displayName ?? response.email;

    const model: LetterViewModel = {
      to: response.email,
      from: this.config.emailFrom,
      subject: "Carta de Aceptación Oficial al Taller de Santa",
      html: renderAcceptanceLetterHtml({
        displayName,
        verificationUrl,
      }),
      attachments: loadInlineEmailAttachments(),
    };

    await this.mailView.render(model);
  }
}
