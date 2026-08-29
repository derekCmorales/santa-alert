import { DomainError } from "./DomainError.js";

export class ValidationError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}
