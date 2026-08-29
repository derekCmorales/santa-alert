import type { VerifyElfRequester } from "../../interactors/verify-elf/VerifyElfRequester.js";
import type { JsonVerifyPresenter } from "../../presenters/json/JsonVerifyPresenter.js";

export interface VerifyElfHttpInput {
  rawToken: string;
}

export class VerifyElfController {
  constructor(
    private readonly requester: VerifyElfRequester,
    private readonly presenter: JsonVerifyPresenter,
  ) {}

  async handle(input: VerifyElfHttpInput): Promise<void> {
    const response = await this.requester.execute({ rawToken: input.rawToken });
    this.presenter.present(response);
  }
}
