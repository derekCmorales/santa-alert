import { ValidationError } from "../errors/ValidationError.js";
import type { ValidationIssue, ValidationRule } from "./ValidationRule.js";

export class FormPolicy {
  constructor(private readonly rules: readonly ValidationRule[]) {}

  validate(input: Record<string, string>): ValidationIssue[] {
    return this.rules
      .map((rule) => rule.validate(input[rule.field] ?? ""))
      .filter((issue): issue is ValidationIssue => issue !== null);
  }

  assert(input: Record<string, string>): void {
    const [first] = this.validate(input);
    if (first) {
      throw new ValidationError(first.code, first.message);
    }
  }
}
