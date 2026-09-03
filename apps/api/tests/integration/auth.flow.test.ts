import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, rmSync } from "node:fs";
import {
  buildLoginController,
  buildRegisterController,
  buildVerifyController,
  loadConfig,
} from "../../src/composition/CompositionRoot.js";
import {
  createElfAccountGateway,
  type ElfAccountStore,
} from "../../src/database/createElfAccountGateway.js";
import type { ElfAccountGateway } from "../../src/interactors/shared/ElfAccountGateway.js";
import { ConsoleMailView } from "../../src/views/mail/ConsoleMailView.js";
import type { JsonViewModel } from "../../src/presenters/json/JsonView.js";

const TEST_DB = "file:./test-integration.db";

async function expectRegisterVerifyLogin(gateway: ElfAccountGateway): Promise<void> {
  const config = loadConfig();
  const uniqueEmail = `flow-${Date.now()}-${Math.random().toString(16).slice(2)}@polo.norte`;
  let registerModel: JsonViewModel | null = null;
  ConsoleMailView.reset();

  const registerController = buildRegisterController(
    gateway,
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

  let loginDenied: JsonViewModel | null = null;
  const loginController = buildLoginController(gateway, config, {
    render(model: JsonViewModel) {
      loginDenied = model;
    },
  });
  await loginController.handle({
    email: uniqueEmail,
    password: "password1234",
  });
  expect(loginDenied?.status).toBe(403);

  let verifyModel: JsonViewModel | null = null;
  const verifyController = buildVerifyController(gateway, {
    render(model: JsonViewModel) {
      verifyModel = model;
    },
  });
  await verifyController.handle({ rawToken: token! });
  expect(verifyModel?.body.data).toMatchObject({
    message: expect.stringContaining("verificada"),
  });

  let loginOk: JsonViewModel | null = null;
  const loginController2 = buildLoginController(gateway, config, {
    render(model: JsonViewModel) {
      loginOk = model;
    },
  });
  await loginController2.handle({
    email: uniqueEmail,
    password: "password1234",
  });

  expect(loginOk?.status).toBe(200);
  expect(loginOk?.body.data).toHaveProperty("accessToken");
}

describe("Auth integration flow (prisma)", () => {
  let store: ElfAccountStore;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB;
    if (existsSync("test-integration.db")) {
      rmSync("test-integration.db");
    }
    const { execSync } = await import("node:child_process");
    execSync("npx prisma db push --skip-generate", {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DB },
      stdio: "pipe",
    });
    store = await createElfAccountGateway({
      dbDriver: "prisma",
      databaseUrl: TEST_DB,
    });
  });

  afterAll(async () => {
    await store.disconnect();
    if (existsSync("test-integration.db")) {
      rmSync("test-integration.db");
    }
  });

  it("register → login denied → verify → login", async () => {
    await expectRegisterVerifyLogin(store.gateway);
  });
});

describe("Auth integration flow (pglite)", () => {
  let store: ElfAccountStore;

  beforeAll(async () => {
    store = await createElfAccountGateway({ dbDriver: "pglite" });
  });

  afterAll(async () => {
    await store.disconnect();
  });

  it("register → login denied → verify → login", async () => {
    await expectRegisterVerifyLogin(store.gateway);
  });
});
