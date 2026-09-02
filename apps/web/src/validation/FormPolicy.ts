import type { ValidationIssue, ValidationRule } from "./ValidationRule";

export class FormPolicy {
  constructor(private readonly rules: readonly ValidationRule[]) {}

  validate(input: Record<string, string>): ValidationIssue[] {
    return this.rules
      .map((rule) => rule.validate(input[rule.field] ?? ""))
      .filter((issue): issue is ValidationIssue => issue !== null);
  }
}
