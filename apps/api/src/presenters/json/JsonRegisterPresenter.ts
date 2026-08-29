import type { RegisterElfResponse } from "../../interactors/register-elf/RegisterElfResponse.js";
import type { JsonView, JsonViewModel } from "./JsonView.js";

export class JsonRegisterPresenter {
  constructor(private readonly view: JsonView) {}

  present(response: RegisterElfResponse): void {
    const model: JsonViewModel = {
      status: 201,
      body: {
        success: true,
        data: {
          message:
            "Tu solicitud fue recibida. Revisa tu pergamino: la Carta de Aceptación está en camino.",
          email: response.email,
        },
        error: null,
        meta: {
          pendingVerification: true,
        },
      },
    };

    this.view.render(model);
  }

  presentValidationError(code: string, message: string): void {
    this.view.render({
      status: 422,
      body: {
        success: false,
        data: null,
        error: { code, message },
        meta: null,
      },
    });
  }
}
