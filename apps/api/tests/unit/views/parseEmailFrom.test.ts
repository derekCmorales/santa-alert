import { describe, expect, it } from "vitest";
import { parseEmailFrom } from "../../../src/views/mail/parseEmailFrom.js";

describe("parseEmailFrom", () => {
  it("splits display name and address from RFC-style sender", () => {
    expect(parseEmailFrom("North Pole HR <hr@northpole.test>")).toEqual({
      email: "hr@northpole.test",
      name: "North Pole HR",
    });
  });

  it("uses the raw address when no display name is present", () => {
    expect(parseEmailFrom("hr@northpole.test")).toEqual({
      email: "hr@northpole.test",
    });
  });

  it("rejects an empty sender", () => {
    expect(() => parseEmailFrom("   ")).toThrow("EMAIL_FROM must be a non-empty sender address.");
  });
});
