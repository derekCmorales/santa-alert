import type { VerifyElfResponse } from "../../interactors/verify-elf/VerifyElfResponse.js";
import type { JsonView, JsonViewModel } from "./JsonView.js";

export class JsonVerifyPresenter {
  constructor(private readonly view: JsonView) {}

  present(response: VerifyElfResponse): void {
    const models: Record<VerifyElfResponse["outcome"], JsonViewModel> = {
      VERIFIED: {
        status: 200,
        body: {
          success: true,
          data: {
            message: "¡Bienvenido al taller! Tu cuenta ha sido verificada.",
            email: response.email,
            displayName: response.displayName,
          },
          error: null,
          meta: null,
        },
      },
      ALREADY_VERIFIED: {
        status: 200,
        body: {
          success: true,
          data: {
            message: "Tu cuenta ya estaba verificada. Puedes iniciar sesión.",
            email: response.email,
            displayName: response.displayName,
          },
          error: null,
          meta: { alreadyVerified: true },
        },
      },
      EXPIRED: {
        status: 400,
        body: {
          success: false,
          data: null,
          error: {
            code: "VERIFICATION_TOKEN_EXPIRED",
            message: "La carta ha expirado. Solicita un nuevo registro.",
          },
          meta: null,
        },
      },
      INVALID: {
        status: 400,
        body: {
          success: false,
          data: null,
          error: {
            code: "VERIFICATION_TOKEN_INVALID",
            message: "El sello de la carta no es válido.",
          },
          meta: null,
        },
      },
    };

    this.view.render(models[response.outcome]);
  }
}
