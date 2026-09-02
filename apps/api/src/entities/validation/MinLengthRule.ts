import type { ValidationIssue, ValidationRule } from "./ValidationRule.js";

export class MinLengthRule implements ValidationRule {
  constructor(
    readonly field: string,
    readonly minLength: number,
    readonly code: string,
    readonly hint: string,
    private readonly options: { trim: boolean } = { trim: true },
  ) {}

  validate(value: string): ValidationIssue | null {
    const candidate = this.options.trim ? value.trim() : value;
    if (candidate.length < this.minLength) {
      return {
        field: this.field,
        code: this.code,
        message: this.hint,
      };
    }
    return null;
  }
}
