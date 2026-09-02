import type { LetterViewModel, MailView } from "../../presenters/acceptance-letter/MailView.js";
import { parseEmailFrom } from "./parseEmailFrom.js";

export interface MailjetInlineAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
  ContentID: string;
}

export interface MailjetSendPayload {
  Messages: Array<{
    From: { Email: string; Name?: string };
    To: Array<{ Email: string }>;
    Subject: string;
    HTMLPart: string;
    InlinedAttachments?: MailjetInlineAttachment[];
  }>;
}

export interface MailjetSendResult {
  body: {
    Messages: Array<{
      Status: string;
      Errors?: Array<{ ErrorMessage?: string }>;
    }>;
  };
}

export type MailjetSendFn = (payload: MailjetSendPayload) => Promise<MailjetSendResult>;

const MAILJET_SEND_URL = "https://api.mailjet.com/v3.1/send";

export class MailjetMailView implements MailView {
  constructor(private readonly send: MailjetSendFn) {}

  static fromApiKeys(apiKey: string, apiSecret: string): MailjetMailView {
    return new MailjetMailView((payload) => sendViaMailjetApi(apiKey, apiSecret, payload));
  }

  async render(model: LetterViewModel): Promise<void> {
    let result: MailjetSendResult;
    try {
      result = await this.send(toMailjetPayload(model));
    } catch (error) {
      throw new Error(`Mailjet error: ${errorMessage(error)}`);
    }

    const first = result.body.Messages[0];
    if (!first || first.Status !== "success") {
      const detail = first?.Errors?.[0]?.ErrorMessage ?? first?.Status ?? "unknown error";
      throw new Error(`Mailjet error: ${detail}`);
    }
  }
}

async function sendViaMailjetApi(
  apiKey: string,
  apiSecret: string,
  payload: MailjetSendPayload,
): Promise<MailjetSendResult> {
  const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
  const response = await fetch(MAILJET_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as MailjetSendResult["body"];
  if (!response.ok) {
    const detail = body.Messages?.[0]?.Errors?.[0]?.ErrorMessage ?? `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return { body };
}

function toMailjetPayload(model: LetterViewModel): MailjetSendPayload {
  const parsed = parseEmailFrom(model.from);
  const from = parsed.name
    ? { Email: parsed.email, Name: parsed.name }
    : { Email: parsed.email };

  const message: MailjetSendPayload["Messages"][number] = {
    From: from,
    To: [{ Email: model.to }],
    Subject: model.subject,
    HTMLPart: model.html,
  };

  if (model.attachments && model.attachments.length > 0) {
    return {
      Messages: [
        {
          ...message,
          InlinedAttachments: model.attachments.map((attachment) => ({
            ContentType: attachment.contentType,
            Filename: attachment.filename,
            Base64Content: attachment.content.toString("base64"),
            ContentID: attachment.inlineContentId,
          })),
        },
      ],
    };
  }

  return { Messages: [message] };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
