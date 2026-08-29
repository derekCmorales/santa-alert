export type RegisterElfOutcome = "ACCEPTED" | "DUPLICATE_SILENT";

export interface RegisterElfResponse {
  outcome: RegisterElfOutcome;
  email: string;
  displayName?: string;
  rawVerificationToken?: string;
}
