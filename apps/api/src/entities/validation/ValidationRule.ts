export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface ValidationRule {
  readonly field: string;
  readonly hint: string;
  readonly minLength: number;
  validate(value: string): ValidationIssue | null;
}
