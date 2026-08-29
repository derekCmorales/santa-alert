import type { AuthClaims } from "./JoseSessionTokenIssuer.js";

export interface SessionTokenVerifier {
  verifyFromHeader(authorizationHeader?: string): Promise<AuthClaims | null>;
}

export class JoseSessionTokenVerifier implements SessionTokenVerifier {
  constructor(private readonly issuer: { verify(token: string): Promise<AuthClaims | null> }) {}

  async verifyFromHeader(authorizationHeader?: string): Promise<AuthClaims | null> {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      return null;
    }
    const token = authorizationHeader.slice("Bearer ".length).trim();
    if (!token) {
      return null;
    }
    return this.issuer.verify(token);
  }
}
