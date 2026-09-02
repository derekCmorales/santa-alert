import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AccountStatus } from "../../../src/entities/AccountStatus.js";
import { Email } from "../../../src/entities/Email.js";
import { Elf } from "../../../src/entities/Elf.js";
import { ElfId } from "../../../src/entities/ElfId.js";
import { PgliteElfAccountMapper } from "../../../src/database/PgliteElfAccountMapper.js";

function makeElf(overrides: {
  email?: string;
  status?: AccountStatus;
  verificationTokenHash?: string | null;
  verificationExpiresAt?: Date | null;
} = {}): Elf {
  return Elf.reconstitute({
    id: ElfId.create(),
    email: Email.create(overrides.email ?? "buddy@polo.norte"),
    displayName: "Buddy",
    passwordHash: "hashed:pw",
    status: overrides.status ?? AccountStatus.UNVERIFIED,
    verificationTokenHash:
      overrides.verificationTokenHash === undefined
        ? "token-hash"
        : overrides.verificationTokenHash,
    verificationExpiresAt:
      overrides.verificationExpiresAt === undefined
        ? new Date("2025-12-02T10:00:00Z")
        : overrides.verificationExpiresAt,
  });
}

describe("PgliteElfAccountMapper", () => {
  let mapper: PgliteElfAccountMapper;

  beforeAll(async () => {
    mapper = await PgliteElfAccountMapper.inMemory();
  });

  afterAll(async () => {
    await mapper.close();
  });

  it("round-trips an elf through save and findByEmail", async () => {
    const elf = makeElf({ email: "roundtrip@polo.norte" });

    await mapper.save(elf);

    const found = await mapper.findByEmail(elf.email);
    expect(found).not.toBeNull();
    expect(found?.id.value).toBe(elf.id.value);
    expect(found?.email.value).toBe("roundtrip@polo.norte");
    expect(found?.displayName).toBe("Buddy");
    expect(found?.status).toBe(AccountStatus.UNVERIFIED);
    expect(found?.passwordHash).toBe("hashed:pw");
  });

  it("finds by id and verification token hash", async () => {
    const elf = makeElf({
      email: "by-id@polo.norte",
      verificationTokenHash: "abc-hash",
    });
    await mapper.save(elf);

    const byId = await mapper.findById(elf.id);
    expect(byId?.email.value).toBe("by-id@polo.norte");

    const byToken = await mapper.findByVerificationTokenHash("abc-hash");
    expect(byToken?.id.value).toBe(elf.id.value);
  });

  it("returns null when the elf does not exist", async () => {
    expect(await mapper.findByEmail(Email.create("missing@polo.norte"))).toBeNull();
    expect(await mapper.findById(ElfId.create())).toBeNull();
    expect(await mapper.findByVerificationTokenHash("nope")).toBeNull();
  });

  it("preserves verificationExpiresAt as a Date", async () => {
    const expires = new Date("2025-12-02T10:00:00.000Z");
    const elf = makeElf({
      email: "dates@polo.norte",
      verificationExpiresAt: expires,
    });
    await mapper.save(elf);

    const found = await mapper.findByEmail(elf.email);
    expect(found?.verificationExpiresAt).toBeInstanceOf(Date);
    expect(found?.verificationExpiresAt?.toISOString()).toBe(expires.toISOString());
  });

  it("updates status on save of the same id (verify path)", async () => {
    const unverified = makeElf({ email: "verify-path@polo.norte" });
    await mapper.save(unverified);

    const verified = unverified.verify(new Date("2025-12-01T12:00:00Z"));
    await mapper.save(verified);

    const found = await mapper.findByEmail(unverified.email);
    expect(found?.status).toBe(AccountStatus.VERIFIED);
    expect(found?.verificationTokenHash).toBeNull();
    expect(found?.verificationExpiresAt).toBeNull();
  });
});
