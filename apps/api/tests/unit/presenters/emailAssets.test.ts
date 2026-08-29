import { describe, expect, it } from "vitest";
import { loadInlineEmailAttachments } from "../../../src/presenters/acceptance-letter/emailAssets.js";

describe("emailAssets", () => {
  it("loads all inline email attachments from web public assets", () => {
    const attachments = loadInlineEmailAttachments();

    expect(attachments).toHaveLength(5);
    expect(attachments.map((attachment) => attachment.filename)).toEqual([
      "logo.png",
      "hero.png",
      "divider1.png",
      "divider2.png",
      "footer-bg.png",
    ]);
    expect(attachments.every((attachment) => attachment.content.byteLength > 0)).toBe(true);
    expect(attachments.every((attachment) => attachment.inlineContentId.startsWith("north-pole-"))).toBe(
      true,
    );
  });
});
