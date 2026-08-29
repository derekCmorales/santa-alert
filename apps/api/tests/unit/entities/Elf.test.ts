import { describe, expect, it } from "vitest";
import { AccountStatus } from "../../../src/entities/AccountStatus.js";
import { Email } from "../../../src/entities/Email.js";
import { Elf } from "../../../src/entities/Elf.js";
import { AccountNotVerifiedError } from "../../../src/entities/errors/AccountNotVerifiedError.js";

describe("Elf entity", () => {
  const email = Email.create("elfo@polo.norte");
  const now = new Date("2025-12-01T10:00:00Z");
  const expires = new Date(now.getTime() + 60_000);

  it("registers as UNVERIFIED", () => {
    const elf = Elf.register({
      email,
      displayName: "Buddy",
      passwordHash: "hash",
      verificationTokenHash: "token-hash",
      verificationExpiresAt: expires,
    });

    expect(elf.status).toBe(AccountStatus.UNVERIFIED);
    expect(elf.displayName).toBe("Buddy");
  });

  it("verify returns new instance and clears token", () => {
    const elf = Elf.register({
      email,
      displayName: "Buddy",
      passwordHash: "hash",
      verificationTokenHash: "token-hash",
      verificationExpiresAt: expires,
    });

    const verified = elf.verify(now);
    expect(verified).not.toBe(elf);
    expect(verified.status).toBe(AccountStatus.VERIFIED);
    expect(verified.verificationTokenHash).toBeNull();
    expect(elf.status).toBe(AccountStatus.UNVERIFIED);
  });

  it("assertCanLogin throws when unverified", () => {
    const elf = Elf.register({
      email,
      displayName: "Buddy",
      passwordHash: "hash",
      verificationTokenHash: "token-hash",
      verificationExpiresAt: expires,
    });

    expect(() => elf.assertCanLogin()).toThrow(AccountNotVerifiedError);
  });

  it("matches verification token when valid and not expired", () => {
    const elf = Elf.register({
      email,
      displayName: "Buddy",
      passwordHash: "hash",
      verificationTokenHash: "token-hash",
      verificationExpiresAt: expires,
    });

    expect(elf.matchesVerificationTokenHash("token-hash", now)).toBe(true);
    expect(elf.matchesVerificationTokenHash("wrong", now)).toBe(false);
    expect(
      elf.matchesVerificationTokenHash("token-hash", new Date(expires.getTime() + 1)),
    ).toBe(false);
  });
});

describe("Email value object", () => {
  it("normalizes and validates email", () => {
    const email = Email.create("  ElFo@POLO.NORTE  ");
    expect(email.value).toBe("elfo@polo.norte");
  });

  it("rejects invalid email", () => {
    expect(() => Email.create("not-an-email")).toThrow();
  });
});
