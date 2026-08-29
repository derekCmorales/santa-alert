import { DomainError } from "./DomainError.js";

export class AccountNotVerifiedError extends DomainError {
  constructor() {
    super(
      "ACCOUNT_NOT_VERIFIED",
      "Debes abrir la Carta de Aceptación antes de entrar al taller.",
    );
  }
}
