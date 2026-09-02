import type { MailView } from "../../presenters/acceptance-letter/MailView.js";
import { ConsoleMailView } from "./ConsoleMailView.js";
import { MailjetMailView } from "./MailjetMailView.js";
import { ResendMailView } from "./ResendMailView.js";

export type MailDriver = "console" | "resend" | "mailjet";

export interface MailViewConfig {
  mailDriver: MailDriver;
  resendApiKey?: string;
  mailjetApiKey?: string;
  mailjetApiSecret?: string;
}

export function parseMailDriver(raw: string | undefined): MailDriver {
  if (raw === undefined || raw === "" || raw === "console") {
    return "console";
  }
  if (raw === "resend" || raw === "mailjet") {
    return raw;
  }
  throw new Error(`Unknown MAIL_DRIVER: ${raw}. Use console, resend, or mailjet.`);
}

export function createMailView(config: MailViewConfig): MailView {
  switch (config.mailDriver) {
    case "console":
      return new ConsoleMailView();
    case "resend": {
      if (!config.resendApiKey) {
        throw new Error("RESEND_API_KEY must be set when MAIL_DRIVER=resend.");
      }
      return new ResendMailView(config.resendApiKey);
    }
    case "mailjet": {
      if (!config.mailjetApiKey || !config.mailjetApiSecret) {
        throw new Error(
          "MAILJET_API_KEY and MAILJET_API_SECRET must be set when MAIL_DRIVER=mailjet.",
        );
      }
      return MailjetMailView.fromApiKeys(config.mailjetApiKey, config.mailjetApiSecret);
    }
    default: {
      const unexpected: never = config.mailDriver;
      throw new Error(`Unknown MAIL_DRIVER: ${String(unexpected)}`);
    }
  }
}
