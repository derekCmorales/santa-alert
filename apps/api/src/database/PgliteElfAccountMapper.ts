import { PGlite } from "@electric-sql/pglite";
import { AccountStatus } from "../entities/AccountStatus.js";
import { Email } from "../entities/Email.js";
import { Elf } from "../entities/Elf.js";
import { ElfId } from "../entities/ElfId.js";
import type { ElfAccountGateway } from "../interactors/shared/ElfAccountGateway.js";
import { PGLITE_ELF_ACCOUNT_SCHEMA } from "./pgliteElfAccountSchema.sql.js";

export interface PgliteSqlClient {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec(sql: string): Promise<unknown>;
  close(): Promise<void>;
}

interface ElfAccountRow {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  status: string;
  verificationTokenHash: string | null;
  verificationExpiresAt: Date | string | null;
}

export class PgliteElfAccountMapper implements ElfAccountGateway {
  constructor(private readonly client: PgliteSqlClient) {}

  static async inMemory(): Promise<PgliteElfAccountMapper> {
    const client = await PGlite.create();
    const mapper = new PgliteElfAccountMapper(client);
    await mapper.ensureSchema();
    return mapper;
  }

  static async fromDataDir(dataDir: string): Promise<PgliteElfAccountMapper> {
    const client = await PGlite.create(dataDir);
    const mapper = new PgliteElfAccountMapper(client);
    await mapper.ensureSchema();
    return mapper;
  }

  private async ensureSchema(): Promise<void> {
    await this.withPglite(() => this.client.exec(PGLITE_ELF_ACCOUNT_SCHEMA));
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  async findById(id: ElfId): Promise<Elf | null> {
    const row = await this.findOne("id", id.value);
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<Elf | null> {
    const row = await this.findOne("email", email.value);
    return row ? this.toDomain(row) : null;
  }

  async findByVerificationTokenHash(hash: string): Promise<Elf | null> {
    const row = await this.findOne("verificationTokenHash", hash);
    return row ? this.toDomain(row) : null;
  }

  async save(elf: Elf): Promise<void> {
    const props = elf.toProps();
    await this.withPglite(() =>
      this.client.query(
        `
        INSERT INTO "ElfAccount" (
          "id", "email", "displayName", "passwordHash", "status",
          "verificationTokenHash", "verificationExpiresAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "email" = EXCLUDED."email",
          "displayName" = EXCLUDED."displayName",
          "passwordHash" = EXCLUDED."passwordHash",
          "status" = EXCLUDED."status",
          "verificationTokenHash" = EXCLUDED."verificationTokenHash",
          "verificationExpiresAt" = EXCLUDED."verificationExpiresAt",
          "updatedAt" = NOW()
        `,
        [
          props.id.value,
          props.email.value,
          props.displayName,
          props.passwordHash,
          props.status,
          props.verificationTokenHash,
          props.verificationExpiresAt,
        ],
      ),
    );
  }

  private async findOne(
    column: "id" | "email" | "verificationTokenHash",
    value: string,
  ): Promise<ElfAccountRow | undefined> {
    const result = await this.withPglite(() =>
      this.client.query<ElfAccountRow>(
        `
        SELECT "id", "email", "displayName", "passwordHash", "status",
               "verificationTokenHash", "verificationExpiresAt"
        FROM "ElfAccount"
        WHERE "${column}" = $1
        LIMIT 1
        `,
        [value],
      ),
    );
    return result.rows[0];
  }

  private toDomain(row: ElfAccountRow): Elf {
    return Elf.reconstitute({
      id: ElfId.create(row.id),
      email: Email.create(row.email),
      displayName: row.displayName,
      passwordHash: row.passwordHash,
      status: row.status as AccountStatus,
      verificationTokenHash: row.verificationTokenHash,
      verificationExpiresAt: toDate(row.verificationExpiresAt),
    });
  }

  private async withPglite<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.startsWith("PGlite error:")) {
        throw error;
      }
      throw new Error(`PGlite error: ${message}`, { cause: error });
    }
  }
}

function toDate(value: Date | string | null): Date | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`PGlite error: invalid date ${value}`);
  }
  return parsed;
}
