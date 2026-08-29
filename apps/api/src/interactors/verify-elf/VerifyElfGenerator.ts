import { AccountStatus } from "../../entities/AccountStatus.js";
import type { CryptoGateway } from "../shared/CryptoGateway.js";
import type { ElfAccountGateway } from "../shared/ElfAccountGateway.js";
import type { VerifyElfRequest } from "./VerifyElfRequest.js";
import type { VerifyElfRequester } from "./VerifyElfRequester.js";
import type { VerifyElfResponse } from "./VerifyElfResponse.js";

export class VerifyElfGenerator implements VerifyElfRequester {
  constructor(
    private readonly gateway: ElfAccountGateway,
    private readonly crypto: CryptoGateway,
  ) {}

  async execute(request: VerifyElfRequest): Promise<VerifyElfResponse> {
    if (!request.rawToken?.trim()) {
      return { outcome: "INVALID" };
    }

    const hash = this.crypto.hashVerificationToken(request.rawToken.trim());
    const elf = await this.gateway.findByVerificationTokenHash(hash);

    if (!elf) {
      return { outcome: "INVALID" };
    }

    if (elf.status === AccountStatus.VERIFIED) {
      return {
        outcome: "ALREADY_VERIFIED",
        email: elf.email.value,
        displayName: elf.displayName,
      };
    }

    const now = this.crypto.now();
    if (!elf.matchesVerificationTokenHash(hash, now)) {
      return { outcome: "EXPIRED" };
    }

    const verified = elf.verify(now);
    await this.gateway.save(verified);

    return {
      outcome: "VERIFIED",
      email: verified.email.value,
      displayName: verified.displayName,
    };
  }
}
