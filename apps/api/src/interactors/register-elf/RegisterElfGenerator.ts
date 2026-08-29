import { Email } from "../../entities/Email.js";
import { Elf } from "../../entities/Elf.js";
import type { CryptoGateway } from "../shared/CryptoGateway.js";
import type { ElfAccountGateway } from "../shared/ElfAccountGateway.js";
import type { RegisterElfRequest } from "./RegisterElfRequest.js";
import type { RegisterElfRequester } from "./RegisterElfRequester.js";
import type { RegisterElfResponse } from "./RegisterElfResponse.js";

export class RegisterElfGenerator implements RegisterElfRequester {
  constructor(
    private readonly gateway: ElfAccountGateway,
    private readonly crypto: CryptoGateway,
  ) {}

  async execute(request: RegisterElfRequest): Promise<RegisterElfResponse> {
    const email = Email.create(request.email);
    Elf.validatePassword(request.password);

    const existing = await this.gateway.findByEmail(email);
    if (existing) {
      return {
        outcome: "DUPLICATE_SILENT",
        email: email.value,
      };
    }

    const now = this.crypto.now();
    const token = this.crypto.generateVerificationToken();
    const passwordHash = await this.crypto.hashPassword(request.password);

    const elf = Elf.register({
      email,
      displayName: request.displayName,
      passwordHash,
      verificationTokenHash: token.hash,
      verificationExpiresAt: Elf.verificationExpiryFrom(now),
    });

    await this.gateway.save(elf);

    return {
      outcome: "ACCEPTED",
      email: email.value,
      displayName: elf.displayName,
      rawVerificationToken: token.raw,
    };
  }
}
