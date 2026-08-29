import type { LoginElfResponse } from "../../interactors/login-elf/LoginElfResponse.js";
import type { JsonView, JsonViewModel } from "./JsonView.js";

export interface SessionTokenIssuer {
  issue(payload: { elfId: string; email: string; displayName: string }): Promise<string>;
}

export class JsonLoginPresenter {
  constructor(
    private readonly view: JsonView,
    private readonly tokenIssuer: SessionTokenIssuer,
  ) {}

  async present(response: LoginElfResponse): Promise<void> {
    if (response.outcome === "INVALID") {
      this.render({
        status: 401,
        body: {
          success: false,
          data: null,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Credenciales inválidas.",
          },
          meta: null,
        },
      });
      return;
    }

    if (response.outcome === "NOT_VERIFIED") {
      this.render({
        status: 403,
        body: {
          success: false,
          data: null,
          error: {
            code: "ACCOUNT_NOT_VERIFIED",
            message:
              "Debes abrir la Carta de Aceptación antes de entrar al taller.",
          },
          meta: null,
        },
      });
      return;
    }

    const accessToken = await this.tokenIssuer.issue({
      elfId: response.elfId!,
      email: response.email!,
      displayName: response.displayName!,
    });

    this.render({
      status: 200,
      body: {
        success: true,
        data: {
          accessToken,
          elf: {
            id: response.elfId,
            email: response.email,
            displayName: response.displayName,
          },
        },
        error: null,
        meta: null,
      },
    });
  }

  presentValidationError(code: string, message: string): void {
    this.render({
      status: 422,
      body: {
        success: false,
        data: null,
        error: { code, message },
        meta: null,
      },
    });
  }

  private render(model: JsonViewModel): void {
    this.view.render(model);
  }
}
