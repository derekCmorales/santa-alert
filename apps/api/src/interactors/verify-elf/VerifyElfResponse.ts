export interface VerifyElfRequest {
  rawToken: string;
}

export type VerifyElfOutcome =
  | "VERIFIED"
  | "INVALID"
  | "EXPIRED"
  | "ALREADY_VERIFIED";

export interface VerifyElfResponse {
  outcome: VerifyElfOutcome;
  email?: string;
  displayName?: string;
}
