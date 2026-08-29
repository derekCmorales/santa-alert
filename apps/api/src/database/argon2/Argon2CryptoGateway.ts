import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import type { CryptoGateway, GeneratedToken } from "../../interactors/shared/CryptoGateway.js";

export class Argon2CryptoGateway implements CryptoGateway {
  async hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  generateVerificationToken(): GeneratedToken {
    const raw = randomBytes(32).toString("hex");
    return { raw, hash: this.hashVerificationToken(raw) };
  }

  hashVerificationToken(raw: string): string {
    return createHash("sha256").update(raw).digest("hex");
  }

  now(): Date {
    return new Date();
  }
}
