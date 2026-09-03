import { afterEach, describe, expect, it } from "vitest";
import { ElfAccountMapper } from "../../../src/database/ElfAccountMapper.js";
import {
  createElfAccountGateway,
  parseDbDriver,
} from "../../../src/database/createElfAccountGateway.js";
import { PgliteElfAccountMapper } from "../../../src/database/PgliteElfAccountMapper.js";

describe("parseDbDriver", () => {
  it("defaults to prisma when unset or empty", () => {
    expect(parseDbDriver(undefined)).toBe("prisma");
    expect(parseDbDriver("")).toBe("prisma");
  });

  it("accepts prisma and pglite", () => {
    expect(parseDbDriver("prisma")).toBe("prisma");
    expect(parseDbDriver("pglite")).toBe("pglite");
  });

  it("rejects an unknown driver instead of falling back to prisma", () => {
    expect(() => parseDbDriver("mysql")).toThrow(
      "Unknown DB_DRIVER: mysql. Use prisma or pglite.",
    );
  });
});

describe("createElfAccountGateway", () => {
  const stores: Array<{ disconnect: () => Promise<void> }> = [];

  afterEach(async () => {
    await Promise.all(stores.splice(0).map((store) => store.disconnect()));
  });

  it("returns PgliteElfAccountMapper for the pglite driver", async () => {
    const store = await createElfAccountGateway({ dbDriver: "pglite" });
    stores.push(store);
    expect(store.gateway).toBeInstanceOf(PgliteElfAccountMapper);
  });

  it("returns ElfAccountMapper for the prisma driver", async () => {
    const store = await createElfAccountGateway({ dbDriver: "prisma" });
    stores.push(store);
    expect(store.gateway).toBeInstanceOf(ElfAccountMapper);
  });
});
