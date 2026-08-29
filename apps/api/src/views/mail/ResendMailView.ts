import { Resend } from "resend";
import type { LetterViewModel, MailView } from "../../presenters/acceptance-letter/MailView.js";

export class ResendMailView implements MailView {
  private readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async render(model: LetterViewModel): Promise<void> {
    const result = await this.client.emails.send({
      from: model.from,
      to: model.to,
      subject: model.subject,
      html: model.html,
      attachments: model.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
        inlineContentId: attachment.inlineContentId,
      })),
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }
  }
}
