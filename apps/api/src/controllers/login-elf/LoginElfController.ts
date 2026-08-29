import type { LoginElfRequest } from "../../interactors/login-elf/LoginElfRequest.js";
import type { LoginElfRequester } from "../../interactors/login-elf/LoginElfRequester.js";
import type { JsonLoginPresenter } from "../../presenters/json/JsonLoginPresenter.js";
import { ValidationError } from "../../entities/errors/ValidationError.js";
import { Elf } from "../../entities/Elf.js";

export interface LoginElfHttpInput {
  email: string;
  password: string;
}

export class LoginElfController {
  constructor(
    private readonly requester: LoginElfRequester,
    private readonly presenter: JsonLoginPresenter,
  ) {}

  async handle(input: LoginElfHttpInput): Promise<void> {
    try {
      Elf.validatePassword(input.password);
      const response = await this.requester.execute({
        email: input.email,
        password: input.password,
      } satisfies LoginElfRequest);
      await this.presenter.present(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        this.presenter.presentValidationError(error.code, error.message);
        return;
      }
      throw error;
    }
  }
}
