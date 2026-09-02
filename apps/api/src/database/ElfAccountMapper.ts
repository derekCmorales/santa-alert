import { PrismaClient } from "@prisma/client";
import { AccountStatus } from "../entities/AccountStatus.js";
import { Email } from "../entities/Email.js";
import { Elf } from "../entities/Elf.js";
import { ElfId } from "../entities/ElfId.js";
import type { ElfAccountGateway } from "../interactors/shared/ElfAccountGateway.js";

export class ElfAccountMapper implements ElfAccountGateway {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ElfId): Promise<Elf | null> {
    const row = await this.db.elfAccount.findUnique({ where: { id: id.value } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<Elf | null> {
    const row = await this.db.elfAccount.findUnique({ where: { email: email.value } });
    return row ? this.toDomain(row) : null;
  }

  async findByVerificationTokenHash(hash: string): Promise<Elf | null> {
    const row = await this.db.elfAccount.findFirst({
      where: { verificationTokenHash: hash },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(elf: Elf): Promise<void> {
    const props = elf.toProps();
    await this.db.elfAccount.upsert({
      where: { id: props.id.value },
      create: {
        id: props.id.value,
        email: props.email.value,
        displayName: props.displayName,
        passwordHash: props.passwordHash,
        status: props.status,
        verificationTokenHash: props.verificationTokenHash,
        verificationExpiresAt: props.verificationExpiresAt,
      },
      update: {
        email: props.email.value,
        displayName: props.displayName,
        passwordHash: props.passwordHash,
        status: props.status,
        verificationTokenHash: props.verificationTokenHash,
        verificationExpiresAt: props.verificationExpiresAt,
      },
    });
  }

  private toDomain(row: {
    id: string;
    email: string;
    displayName: string;
    passwordHash: string;
    status: string;
    verificationTokenHash: string | null;
    verificationExpiresAt: Date | null;
  }): Elf {
    return Elf.reconstitute({
      id: ElfId.create(row.id),
      email: Email.create(row.email),
      displayName: row.displayName,
      passwordHash: row.passwordHash,
      status: row.status as AccountStatus,
      verificationTokenHash: row.verificationTokenHash,
      verificationExpiresAt: row.verificationExpiresAt,
    });
  }
}
