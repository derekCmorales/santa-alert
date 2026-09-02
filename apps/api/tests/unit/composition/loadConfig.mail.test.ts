import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/composition/CompositionRoot.js";

const ORIGINAL_ENV = { ...process.env };

describe("loadConfig mail driver", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.JWT_SECRET = "test-secret-key-for-jwt-signing";
  });

  it("reads mailjet credentials when MAIL_DRIVER=mailjet", () => {
    process.env.MAIL_DRIVER = "mailjet";
    process.env.MAILJET_API_KEY = "mj-public";
    process.env.MAILJET_API_SECRET = "mj-private";

    const config = loadConfig();

    expect(config.mailDriver).toBe("mailjet");
    expect(config.mailjetApiKey).toBe("mj-public");
    expect(config.mailjetApiSecret).toBe("mj-private");
  });

  it("fails when MAIL_DRIVER=mailjet and credentials are missing", () => {
    process.env.MAIL_DRIVER = "mailjet";
    delete process.env.MAILJET_API_KEY;
    delete process.env.MAILJET_API_SECRET;

    expect(() => loadConfig()).toThrow(
      "MAILJET_API_KEY and MAILJET_API_SECRET must be set when MAIL_DRIVER=mailjet.",
    );
  });

  it("rejects an unknown MAIL_DRIVER instead of falling back to console", () => {
    process.env.MAIL_DRIVER = "sendgrid";

    expect(() => loadConfig()).toThrow(
      "Unknown MAIL_DRIVER: sendgrid. Use console, resend, or mailjet.",
    );
  });
});
