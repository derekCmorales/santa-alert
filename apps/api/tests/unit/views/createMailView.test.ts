import { describe, expect, it } from "vitest";
import { ConsoleMailView } from "../../../src/views/mail/ConsoleMailView.js";
import { createMailView } from "../../../src/views/mail/createMailView.js";
import { MailjetMailView } from "../../../src/views/mail/MailjetMailView.js";
import { ResendMailView } from "../../../src/views/mail/ResendMailView.js";

describe("createMailView", () => {
  it("returns ConsoleMailView for the console driver", () => {
    expect(createMailView({ mailDriver: "console" })).toBeInstanceOf(ConsoleMailView);
  });

  it("returns ResendMailView when the resend driver has an API key", () => {
    expect(createMailView({ mailDriver: "resend", resendApiKey: "re_test" })).toBeInstanceOf(
      ResendMailView,
    );
  });

  it("returns MailjetMailView when the mailjet driver has both keys", () => {
    expect(
      createMailView({
        mailDriver: "mailjet",
        mailjetApiKey: "public-key",
        mailjetApiSecret: "private-key",
      }),
    ).toBeInstanceOf(MailjetMailView);
  });

  it("fails fast when mailjet is selected without credentials", () => {
    expect(() => createMailView({ mailDriver: "mailjet" })).toThrow(
      "MAILJET_API_KEY and MAILJET_API_SECRET must be set when MAIL_DRIVER=mailjet.",
    );
  });

  it("fails fast when resend is selected without an API key", () => {
    expect(() => createMailView({ mailDriver: "resend" })).toThrow(
      "RESEND_API_KEY must be set when MAIL_DRIVER=resend.",
    );
  });
});
