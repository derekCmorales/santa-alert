export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface ValidationRule {
  readonly field: string;
  validate(value: string): ValidationIssue | null;
}
