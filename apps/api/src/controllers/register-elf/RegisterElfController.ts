import { ValidationError } from "../../entities/errors/ValidationError.js";
import type { RegisterElfRequest } from "../../interactors/register-elf/RegisterElfRequest.js";
import type { RegisterElfRequester } from "../../interactors/register-elf/RegisterElfRequester.js";
import type { JsonRegisterPresenter } from "../../presenters/json/JsonRegisterPresenter.js";
import type { AcceptanceLetterPresenter } from "../../presenters/acceptance-letter/AcceptanceLetterPresenter.js";
export interface RegisterElfHttpInput {
  email: string;
  password: string;
  displayName: string;
}

export class RegisterElfController {
  constructor(
    private readonly requester: RegisterElfRequester,
    private readonly jsonPresenter: JsonRegisterPresenter,
    private readonly letterPresenter: AcceptanceLetterPresenter,
  ) {}

  async handle(input: RegisterElfHttpInput): Promise<void> {
    const request: RegisterElfRequest = {
      email: input.email,
      password: input.password,
      displayName: input.displayName,
    };

    try {
      const response = await this.requester.execute(request);

      this.jsonPresenter.present(response);

      if (response.outcome === "ACCEPTED") {
        await this.letterPresenter.present(response);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        this.jsonPresenter.presentValidationError(error.code, error.message);
        return;
      }
      throw error;
    }
  }
}
