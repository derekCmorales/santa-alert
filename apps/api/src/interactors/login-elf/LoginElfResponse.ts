export interface LoginElfRequest {
  email: string;
  password: string;
}

export type LoginElfOutcome = "AUTHENTICATED" | "INVALID" | "NOT_VERIFIED";

export interface LoginElfResponse {
  outcome: LoginElfOutcome;
  elfId?: string;
  email?: string;
  displayName?: string;
}
