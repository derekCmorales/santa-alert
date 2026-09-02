import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/composition/CompositionRoot.js";

const ORIGINAL_ENV = { ...process.env };

describe("loadConfig db driver", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    process.env.JWT_SECRET = "test-secret-key-for-jwt-signing";
  });

  it("defaults to prisma when DB_DRIVER is unset", () => {
    delete process.env.DB_DRIVER;
    expect(loadConfig().dbDriver).toBe("prisma");
  });

  it("reads pglite and optional data dir", () => {
    process.env.DB_DRIVER = "pglite";
    process.env.PGLITE_DATA_DIR = "./pglite-data";

    const config = loadConfig();

    expect(config.dbDriver).toBe("pglite");
    expect(config.pgliteDataDir).toBe("./pglite-data");
  });

  it("rejects an unknown DB_DRIVER instead of falling back to prisma", () => {
    process.env.DB_DRIVER = "mysql";

    expect(() => loadConfig()).toThrow("Unknown DB_DRIVER: mysql. Use prisma or pglite.");
  });
});
