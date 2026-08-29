import { describe, expect, it, beforeEach } from "vitest";
import { Email } from "../../../src/entities/Email.js";
import { Elf } from "../../../src/entities/Elf.js";
import { AccountStatus } from "../../../src/entities/AccountStatus.js";
import type { CryptoGateway } from "../../../src/interactors/shared/CryptoGateway.js";
import type { ElfAccountGateway } from "../../../src/interactors/shared/ElfAccountGateway.js";
import { VerifyElfGenerator } from "../../../src/interactors/verify-elf/VerifyElfGenerator.js";
import { LoginElfGenerator } from "../../../src/interactors/login-elf/LoginElfGenerator.js";

class InMemoryElfGateway implements ElfAccountGateway {
  elves = new Map<string, Elf>();

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
  constructor(private readonly fixedNow = new Date("2025-12-01T10:00:00Z")) {}

  now() {
    return this.fixedNow;
  }

  async hashPassword(plain: string) {
    return `hashed:${plain}`;
  }

  async verifyPassword(plain: string, hash: string) {
    return hash === `hashed:${plain}`;
  }

  generateVerificationToken() {
    return { raw: "raw", hash: "hashed-raw" };
  }

  hashVerificationToken(raw: string) {
    return `hashed-${raw}`;
  }
}

describe("VerifyElfGenerator", () => {
  let gateway: InMemoryElfGateway;
  let crypto: FakeCrypto;
  let generator: VerifyElfGenerator;

  beforeEach(async () => {
    gateway = new InMemoryElfGateway();
    crypto = new FakeCrypto();
    generator = new VerifyElfGenerator(gateway, crypto);

    const elf = Elf.register({
      email: Email.create("verify@polo.norte"),
      displayName: "Tinsel",
      passwordHash: "hash",
      verificationTokenHash: "hashed-raw-token",
      verificationExpiresAt: new Date("2025-12-01T11:00:00Z"),
    });
    await gateway.save(elf);
  });

  it("verifies with valid token", async () => {
    const response = await generator.execute({ rawToken: "raw-token" });
    expect(response.outcome).toBe("VERIFIED");

    const saved = await gateway.findByEmail(Email.create("verify@polo.norte"));
    expect(saved?.status).toBe(AccountStatus.VERIFIED);
  });

  it("rejects invalid token", async () => {
    const response = await generator.execute({ rawToken: "wrong" });
    expect(response.outcome).toBe("INVALID");
  });

  it("rejects expired token", async () => {
    crypto = new FakeCrypto(new Date("2025-12-02T10:00:00Z"));
    generator = new VerifyElfGenerator(gateway, crypto);
    const response = await generator.execute({ rawToken: "raw-token" });
    expect(response.outcome).toBe("EXPIRED");
  });
});

describe("LoginElfGenerator", () => {
  let gateway: InMemoryElfGateway;
  let generator: LoginElfGenerator;

  beforeEach(async () => {
    gateway = new InMemoryElfGateway();
    generator = new LoginElfGenerator(gateway, new FakeCrypto());

    const unverified = Elf.register({
      email: Email.create("pending@polo.norte"),
      displayName: "Pending",
      passwordHash: "hashed:secret1234",
      verificationTokenHash: "h",
      verificationExpiresAt: new Date("2025-12-02T10:00:00Z"),
    });
    await gateway.save(unverified);

    const verified = Elf.register({
      email: Email.create("ready@polo.norte"),
      displayName: "Ready",
      passwordHash: "hashed:secret1234",
      verificationTokenHash: "h2",
      verificationExpiresAt: new Date("2025-12-02T10:00:00Z"),
    }).verify(new Date());
    await gateway.save(verified);
  });

  it("returns NOT_VERIFIED without authenticating unverified elf", async () => {
    const response = await generator.execute({
      email: "pending@polo.norte",
      password: "secret1234",
    });
    expect(response.outcome).toBe("NOT_VERIFIED");
    expect(response.elfId).toBeUndefined();
  });

  it("authenticates verified elf", async () => {
    const response = await generator.execute({
      email: "ready@polo.norte",
      password: "secret1234",
    });
    expect(response.outcome).toBe("AUTHENTICATED");
    expect(response.elfId).toBeDefined();
  });
});
