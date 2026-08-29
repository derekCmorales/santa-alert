import type { RegisterElfResponse } from "../../interactors/register-elf/RegisterElfResponse.js";

export interface RegisterElfPresenter {
  present(response: RegisterElfResponse): Promise<void>;
}
