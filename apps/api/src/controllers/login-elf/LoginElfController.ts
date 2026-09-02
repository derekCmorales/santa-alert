import type { LoginElfRequest } from "../../interactors/login-elf/LoginElfRequest.js";
import type { LoginElfRequester } from "../../interactors/login-elf/LoginElfRequester.js";
import type { JsonLoginPresenter } from "../../presenters/json/JsonLoginPresenter.js";

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
    const response = await this.requester.execute({
      email: input.email,
      password: input.password,
    } satisfies LoginElfRequest);
    await this.presenter.present(response);
  }
}
