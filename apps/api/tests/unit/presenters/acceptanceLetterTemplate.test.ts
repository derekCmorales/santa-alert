import { describe, expect, it } from "vitest";
import { renderAcceptanceLetterHtml } from "../../../src/presenters/acceptance-letter/acceptanceLetterTemplate.js";

describe("acceptanceLetterTemplate", () => {
  it("renders North Pole HR copy with verification CTA and hosted assets", () => {
    const html = renderAcceptanceLetterHtml({
      displayName: "Buddy <script>",
      verificationUrl: "http://localhost:5173/verificar?token=abc",
    });

    expect(html).toContain("Carta de Aceptación Oficial");
    expect(html).toContain("Buddy &lt;script&gt;");
    expect(html).toContain("Abrir mi carta y verificar acceso");
    expect(html).toContain("http://localhost:5173/verificar?token=abc");
    expect(html).toContain('src="cid:north-pole-logo"');
    expect(html).toContain("Departamento de Recursos Elfos");
  });
});
