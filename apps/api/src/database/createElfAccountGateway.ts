import { PrismaClient } from "@prisma/client";
import type { ElfAccountGateway } from "../interactors/shared/ElfAccountGateway.js";
import { ElfAccountMapper } from "./ElfAccountMapper.js";
import { PgliteElfAccountMapper } from "./PgliteElfAccountMapper.js";

export type DbDriver = "prisma" | "pglite";

export interface ElfAccountGatewayConfig {
  dbDriver: DbDriver;
  pgliteDataDir?: string;
  databaseUrl?: string;
}

export interface ElfAccountStore {
  gateway: ElfAccountGateway;
  disconnect(): Promise<void>;
}

export function parseDbDriver(raw: string | undefined): DbDriver {
  if (raw === undefined || raw === "" || raw === "prisma") {
    return "prisma";
  }
  if (raw === "pglite") {
    return raw;
  }
  throw new Error(`Unknown DB_DRIVER: ${raw}. Use prisma or pglite.`);
}

export async function createElfAccountGateway(
  config: ElfAccountGatewayConfig,
): Promise<ElfAccountStore> {
  switch (config.dbDriver) {
    case "prisma": {
      const db = new PrismaClient(
        config.databaseUrl
          ? { datasources: { db: { url: config.databaseUrl } } }
          : undefined,
      );
      return {
        gateway: new ElfAccountMapper(db),
        disconnect: () => db.$disconnect(),
      };
    }
    case "pglite": {
      const mapper = config.pgliteDataDir
        ? await PgliteElfAccountMapper.fromDataDir(config.pgliteDataDir)
        : await PgliteElfAccountMapper.inMemory();
      return {
        gateway: mapper,
        disconnect: () => mapper.close(),
      };
    }
    default: {
      const unexpected: never = config.dbDriver;
      throw new Error(`Unknown DB_DRIVER: ${String(unexpected)}`);
    }
  }
}
