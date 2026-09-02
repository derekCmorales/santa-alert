import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { rmSync, existsSync } from "node:fs";
import {
  buildLoginController,
  buildRegisterController,
  buildVerifyController,
  loadConfig,
} from "../../src/composition/CompositionRoot.js";
import { ConsoleMailView } from "../../src/views/mail/ConsoleMailView.js";
import type { JsonViewModel } from "../../src/presenters/json/JsonView.js";

const TEST_DB = "file:./test-integration.db";

describe("Auth integration flow", () => {
  let db: PrismaClient;
  const config = loadConfig();

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB;
    if (existsSync("test-integration.db")) {
      rmSync("test-integration.db");
    }
    db = new PrismaClient({ datasources: { db: { url: TEST_DB } } });
    const { execSync } = await import("node:child_process");
    execSync("npx prisma db push --skip-generate", {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DB },
      stdio: "pipe",
    });
    ConsoleMailView.reset();
  });

  afterAll(async () => {
    await db.$disconnect();
    if (existsSync("test-integration.db")) {
      rmSync("test-integration.db");
    }
  });

  it("register → verify → login → rejects unverified login", async () => {
    const uniqueEmail = `flow-${Date.now()}@polo.norte`;
    let registerModel: JsonViewModel | null = null;
    const registerController = buildRegisterController(
      db,
      config,
      {
        render(model: JsonViewModel) {
          registerModel = model;
        },
      },
      new ConsoleMailView(),
    );

    await registerController.handle({
      email: uniqueEmail,
      password: "password1234",
      displayName: "Flow Elf",
    });

    expect(registerModel?.status).toBe(201);
    expect(ConsoleMailView.lastVerificationUrl).toBeTruthy();

    const url = new URL(ConsoleMailView.lastVerificationUrl!);
    const token = url.searchParams.get("token");
    expect(token).toBeTruthy();

    let verifyModel: JsonViewModel | null = null;
    const verifyController = buildVerifyController(db, {
      render(model: JsonViewModel) {
        verifyModel = model;
      },
    });
    await verifyController.handle({ rawToken: token! });
    expect(verifyModel?.body.data).toMatchObject({
      message: expect.stringContaining("verificada"),
    });

    let loginDenied: JsonViewModel | null = null;
    const loginController = buildLoginController(db, config, {
      render(model: JsonViewModel) {
        loginDenied = model;
      },
    });

    await db.elfAccount.update({
      where: { email: uniqueEmail },
      data: { status: "UNVERIFIED" },
    });

    await loginController.handle({
      email: uniqueEmail,
      password: "password1234",
    });
    expect(loginDenied?.status).toBe(403);

    await verifyController.handle({ rawToken: token! });

    let loginOk: JsonViewModel | null = null;
    const loginController2 = buildLoginController(db, config, {
      render(model: JsonViewModel) {
        loginOk = model;
      },
    });

    await db.elfAccount.update({
      where: { email: uniqueEmail },
      data: { status: "VERIFIED" },
    });

    await loginController2.handle({
      email: uniqueEmail,
      password: "password1234",
    });

    expect(loginOk?.status).toBe(200);
    expect(loginOk?.body.data).toHaveProperty("accessToken");
  });
});
