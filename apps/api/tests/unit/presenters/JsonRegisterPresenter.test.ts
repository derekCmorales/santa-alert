import { describe, expect, it } from "vitest";
import { JsonRegisterPresenter } from "../../../src/presenters/json/JsonRegisterPresenter.js";
import type { JsonViewModel } from "../../../src/presenters/json/JsonView.js";

describe("JsonRegisterPresenter", () => {
  it("does not expose raw verification token in JSON", () => {
    let captured: JsonViewModel | null = null;
    const presenter = new JsonRegisterPresenter({
      render(model) {
        captured = model;
      },
    });

    presenter.present({
      outcome: "ACCEPTED",
      email: "elfo@polo.norte",
      displayName: "Buddy",
      rawVerificationToken: "super-secret-token",
    });

    expect(captured).not.toBeNull();
    const json = JSON.stringify(captured);
    expect(json).not.toContain("super-secret-token");
    expect(json).not.toContain("rawVerificationToken");
    expect(captured!.status).toBe(201);
    expect(captured!.body.success).toBe(true);
  });
});
