export interface LetterInlineAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  inlineContentId: string;
}

export interface LetterViewModel {
  to: string;
  subject: string;
  html: string;
  from: string;
  attachments?: LetterInlineAttachment[];
}

export interface MailView {
  render(model: LetterViewModel): Promise<void>;
}
