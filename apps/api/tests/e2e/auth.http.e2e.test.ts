import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { existsSync, rmSync } from "node:fs";
import Fastify from "fastify";
import { z } from "zod";
import {
  buildLoginController,
  buildRegisterController,
  buildVerifyController,
  buildWorkshopController,
  loadConfig,
} from "../../src/composition/CompositionRoot.js";
import { ConsoleMailView } from "../../src/views/mail/ConsoleMailView.js";
import { createFastifyJsonView } from "../../src/views/http/FastifyJsonView.js";

const TEST_DB = "file:./test-e2e-http.db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifySchema = z.object({
  token: z.string().min(1),
});

describe("Auth HTTP e2e", () => {
  let db: PrismaClient;
  let app: ReturnType<typeof Fastify>;
  const config = loadConfig();

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB;
    if (existsSync("test-e2e-http.db")) {
      rmSync("test-e2e-http.db");
    }

    db = new PrismaClient({ datasources: { db: { url: TEST_DB } } });
    const { execSync } = await import("node:child_process");
    execSync("npx prisma db push --skip-generate", {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: TEST_DB },
      stdio: "pipe",
    });

    ConsoleMailView.reset();
    app = Fastify();

    app.post("/api/v1/auth/register", async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          data: null,
          error: { code: "VALIDATION_ERROR", message: "Datos de registro inválidos." },
          meta: null,
        });
      }
      const view = createFastifyJsonView(reply);
      const controller = buildRegisterController(db, config, view, new ConsoleMailView());
      await controller.handle(parsed.data);
    });

    app.post("/api/v1/auth/login", async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          data: null,
          error: { code: "VALIDATION_ERROR", message: "Datos de inicio de sesión inválidos." },
          meta: null,
        });
      }
      const view = createFastifyJsonView(reply);
      const controller = buildLoginController(db, config, view);
      await controller.handle(parsed.data);
    });

    app.post("/api/v1/auth/verify", async (request, reply) => {
      const parsed = verifySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(422).send({
          success: false,
          data: null,
          error: { code: "VALIDATION_ERROR", message: "Token de verificación requerido." },
          meta: null,
        });
      }
      const view = createFastifyJsonView(reply);
      const controller = buildVerifyController(db, view);
      await controller.handle({ rawToken: parsed.data.token });
    });

    app.get("/api/v1/workshop/board", async (request, reply) => {
      const view = createFastifyJsonView(reply);
      const controller = buildWorkshopController(config, view);
      const auth = request.headers.authorization;
      await controller.handle(typeof auth === "string" ? auth : undefined);
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await db.$disconnect();
    if (existsSync("test-e2e-http.db")) {
      rmSync("test-e2e-http.db");
    }
  });

  it("register → verify → login → workshop board over HTTP", async () => {
    const email = `e2e-${Date.now()}@polo.norte`;
    const password = "password123";

    const registerRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: { email, password, displayName: "E2E Elf" },
    });
    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.json().success).toBe(true);
    expect(ConsoleMailView.lastVerificationUrl).toBeTruthy();

    const token = new URL(ConsoleMailView.lastVerificationUrl!).searchParams.get("token");
    expect(token).toBeTruthy();
    expect(ConsoleMailView.lastLetter?.html).toContain("Abrir mi carta y verificar acceso");

    const loginBeforeVerify = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(loginBeforeVerify.statusCode).toBe(403);

    const verifyRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify",
      payload: { token },
    });
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.json().data.message).toMatch(/verificada/i);

    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email, password },
    });
    expect(loginRes.statusCode).toBe(200);
    const accessToken = loginRes.json().data.accessToken as string;
    expect(accessToken).toBeTruthy();

    const boardRes = await app.inject({
      method: "GET",
      url: "/api/v1/workshop/board",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(boardRes.statusCode).toBe(200);
    expect(boardRes.json().data.greeting).toMatch(/E2E Elf/i);
  });
});
