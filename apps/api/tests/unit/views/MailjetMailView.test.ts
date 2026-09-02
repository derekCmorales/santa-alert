import { afterEach, describe, expect, it, vi } from "vitest";
import type { LetterViewModel } from "../../../src/presenters/acceptance-letter/MailView.js";
import {
  MailjetMailView,
  type MailjetSendFn,
  type MailjetSendPayload,
} from "../../../src/views/mail/MailjetMailView.js";

function letter(overrides: Partial<LetterViewModel> = {}): LetterViewModel {
  return {
    to: "buddy@workshop.test",
    from: "North Pole HR <hr@northpole.test>",
    subject: "Carta de Aceptación Oficial al Taller de Santa",
    html: '<img src="cid:north-pole-logo" alt="logo" />',
    ...overrides,
  };
}

describe("MailjetMailView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the letter view model to Send API v3.1 Messages", async () => {
    let captured: MailjetSendPayload | undefined;
    const send: MailjetSendFn = async (payload) => {
      captured = payload;
      return { body: { Messages: [{ Status: "success" }] } };
    };

    await new MailjetMailView(send).render(letter());

    expect(captured).toEqual({
      Messages: [
        {
          From: { Email: "hr@northpole.test", Name: "North Pole HR" },
          To: [{ Email: "buddy@workshop.test" }],
          Subject: "Carta de Aceptación Oficial al Taller de Santa",
          HTMLPart: '<img src="cid:north-pole-logo" alt="logo" />',
        },
      ],
    });
  });

  it("translates inline CID attachments to InlinedAttachments", async () => {
    let captured: MailjetSendPayload | undefined;
    const send: MailjetSendFn = async (payload) => {
      captured = payload;
      return { body: { Messages: [{ Status: "success" }] } };
    };

    const png = Buffer.from("fake-png-bytes");
    await new MailjetMailView(send).render(
      letter({
        attachments: [
          {
            filename: "logo.png",
            content: png,
            contentType: "image/png",
            inlineContentId: "north-pole-logo",
          },
        ],
      }),
    );

    expect(captured?.Messages[0].InlinedAttachments).toEqual([
      {
        ContentType: "image/png",
        Filename: "logo.png",
        Base64Content: png.toString("base64"),
        ContentID: "north-pole-logo",
      },
    ]);
  });

  it("throws when Mailjet reports a failed message status", async () => {
    const send: MailjetSendFn = async () => ({
      body: {
        Messages: [
          {
            Status: "error",
            Errors: [{ ErrorMessage: "Unverified sender" }],
          },
        ],
      },
    });

    await expect(new MailjetMailView(send).render(letter())).rejects.toThrow(
      "Mailjet error: Unverified sender",
    );
  });

  it("throws when the Mailjet client rejects the request", async () => {
    const send: MailjetSendFn = async () => {
      throw new Error("network down");
    };

    await expect(new MailjetMailView(send).render(letter())).rejects.toThrow(
      "Mailjet error: network down",
    );
  });

  it("fromApiKeys posts the letter to Mailjet Send API v3.1", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ Messages: [{ Status: "success" }] }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    await MailjetMailView.fromApiKeys("public-key", "private-key").render(letter());

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.mailjet.com/v3.1/send");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from("public-key:private-key").toString("base64")}`,
      "Content-Type": "application/json",
    });
    const body = JSON.parse(String(init.body));
    expect(body.Messages[0].To[0].Email).toBe("buddy@workshop.test");
  });

  it("fromApiKeys wraps a non-OK Mailjet HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({
          Messages: [{ Status: "error", Errors: [{ ErrorMessage: "Invalid API key" }] }],
        }),
      })),
    );

    await expect(
      MailjetMailView.fromApiKeys("bad", "keys").render(letter()),
    ).rejects.toThrow("Mailjet error: Invalid API key");
  });
});
