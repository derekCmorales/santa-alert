import { describe, expect, it, beforeEach } from "vitest";
import { Email } from "../../../src/entities/Email.js";
import { Elf } from "../../../src/entities/Elf.js";
import { AccountStatus } from "../../../src/entities/AccountStatus.js";
import type { CryptoGateway } from "../../../src/interactors/shared/CryptoGateway.js";
import type { ElfAccountGateway } from "../../../src/interactors/shared/ElfAccountGateway.js";
import { RegisterElfGenerator } from "../../../src/interactors/register-elf/RegisterElfGenerator.js";

class InMemoryElfGateway implements ElfAccountGateway {
  private elves = new Map<string, Elf>();

  async findById(id: { value: string }) {
    return [...this.elves.values()].find((e) => e.id.value === id.value) ?? null;
  }

  async findByEmail(email: Email) {
    return this.elves.get(email.value) ?? null;
  }

  async findByVerificationTokenHash(hash: string) {
    return (
      [...this.elves.values()].find((e) => e.verificationTokenHash === hash) ?? null
    );
  }

  async save(elf: Elf) {
    this.elves.set(elf.email.value, elf);
  }
}

class FakeCrypto implements CryptoGateway {
  now() {
    return new Date("2025-12-01T10:00:00Z");
  }

  async hashPassword(plain: string) {
    return `hashed:${plain}`;
  }

  async verifyPassword(plain: string, hash: string) {
    return hash === `hashed:${plain}`;
  }

  generateVerificationToken() {
    return { raw: "raw-token-abc", hash: "hashed-raw-token" };
  }

  hashVerificationToken(raw: string) {
    return `hashed-${raw}`;
  }
}

describe("RegisterElfGenerator", () => {
  let gateway: InMemoryElfGateway;
  let generator: RegisterElfGenerator;

  beforeEach(() => {
    gateway = new InMemoryElfGateway();
    generator = new RegisterElfGenerator(gateway, new FakeCrypto());
  });

  it("accepts new elf and stores hashed token not raw", async () => {
    const response = await generator.execute({
      email: "nuevo@polo.norte",
      password: "password123",
      displayName: "Jingles",
    });

    expect(response.outcome).toBe("ACCEPTED");
    expect(response.rawVerificationToken).toBe("raw-token-abc");

    const saved = await gateway.findByEmail(Email.create("nuevo@polo.norte"));
    expect(saved?.status).toBe(AccountStatus.UNVERIFIED);
    expect(saved?.verificationTokenHash).toBe("hashed-raw-token");
    expect(saved?.verificationTokenHash).not.toBe(response.rawVerificationToken);
  });

  it("returns DUPLICATE_SILENT without token for existing email", async () => {
    await generator.execute({
      email: "dup@polo.norte",
      password: "password123",
      displayName: "Dup",
    });

    const response = await generator.execute({
      email: "dup@polo.norte",
      password: "otherpass99",
      displayName: "Other",
    });

    expect(response.outcome).toBe("DUPLICATE_SILENT");
    expect(response.rawVerificationToken).toBeUndefined();
  });
});
