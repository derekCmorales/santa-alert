import { SignJWT, jwtVerify } from "jose";
import type { SessionTokenIssuer } from "../../presenters/json/JsonLoginPresenter.js";

export interface AuthClaims {
  elfId: string;
  email: string;
  displayName: string;
}

export class JoseSessionTokenIssuer implements SessionTokenIssuer {
  private readonly secret: Uint8Array;

  constructor(jwtSecret: string) {
    this.secret = new TextEncoder().encode(jwtSecret);
  }

  async issue(payload: AuthClaims): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(this.secret);
  }

  async verify(token: string): Promise<AuthClaims | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      if (
        typeof payload.elfId !== "string" ||
        typeof payload.email !== "string" ||
        typeof payload.displayName !== "string"
      ) {
        return null;
      }
      return {
        elfId: payload.elfId,
        email: payload.email,
        displayName: payload.displayName,
      };
    } catch {
      return null;
    }
  }
}
