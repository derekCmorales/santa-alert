import { Email } from "../../entities/Email.js";
import { AccountNotVerifiedError } from "../../entities/errors/AccountNotVerifiedError.js";
import type { CryptoGateway } from "../shared/CryptoGateway.js";
import type { ElfAccountGateway } from "../shared/ElfAccountGateway.js";
import type { LoginElfRequest } from "./LoginElfRequest.js";
import type { LoginElfRequester } from "./LoginElfRequester.js";
import type { LoginElfResponse } from "./LoginElfResponse.js";

export class LoginElfGenerator implements LoginElfRequester {
  constructor(
    private readonly gateway: ElfAccountGateway,
    private readonly crypto: CryptoGateway,
  ) {}

  async execute(request: LoginElfRequest): Promise<LoginElfResponse> {
    let email: Email;
    try {
      email = Email.create(request.email);
    } catch {
      return { outcome: "INVALID" };
    }

    const elf = await this.gateway.findByEmail(email);
    if (!elf) {
      return { outcome: "INVALID" };
    }

    const passwordValid = await this.crypto.verifyPassword(
      request.password,
      elf.passwordHash,
    );
    if (!passwordValid) {
      return { outcome: "INVALID" };
    }

    try {
      elf.assertCanLogin();
    } catch (error) {
      if (error instanceof AccountNotVerifiedError) {
        return { outcome: "NOT_VERIFIED", email: elf.email.value };
      }
      throw error;
    }

    return {
      outcome: "AUTHENTICATED",
      elfId: elf.id.value,
      email: elf.email.value,
      displayName: elf.displayName,
    };
  }
}
