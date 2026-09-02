import type { ValidationIssue, ValidationRule } from "./ValidationRule";

export class MinLengthRule implements ValidationRule {
  constructor(
    readonly field: string,
    readonly minLength: number,
    readonly code: string,
    readonly message: string,
    private readonly options: { trim: boolean } = { trim: true },
  ) {}

  get hint(): string {
    return `Mínimo ${this.minLength} caracteres`;
  }

  validate(value: string): ValidationIssue | null {
    const candidate = this.options.trim ? value.trim() : value;
    if (candidate.length < this.minLength) {
      return {
        field: this.field,
        code: this.code,
        message: this.message,
      };
    }
    return null;
  }
}
