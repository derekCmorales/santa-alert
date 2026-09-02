import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { z } from "zod";
import {
  buildLoginController,
  buildRegisterController,
  buildVerifyController,
  buildWorkshopController,
  loadConfig,
} from "../../src/composition/CompositionRoot.js";
import {
  createElfAccountGateway,
  type ElfAccountStore,
} from "../../src/database/createElfAccountGateway.js";
import {
  registerDisplayNameRule,
  registerPasswordRule,
} from "../../src/entities/validation/registerFormPolicy.js";
import { ConsoleMailView } from "../../src/views/mail/ConsoleMailView.js";
import { createFastifyJsonView } from "../../src/views/http/FastifyJsonView.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(registerPasswordRule.minLength),
  displayName: z.string().min(registerDisplayNameRule.minLength),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verifySchema = z.object({
  token: z.string().min(1),
});

describe("Auth HTTP e2e (pglite)", () => {
  let store: ElfAccountStore;
  let app: ReturnType<typeof Fastify>;
  const config = loadConfig();

  beforeAll(async () => {
    store = await createElfAccountGateway({ dbDriver: "pglite" });
    const accounts = store.gateway;
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
      const controller = buildRegisterController(accounts, config, view, new ConsoleMailView());
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
      const controller = buildLoginController(accounts, config, view);
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
      const controller = buildVerifyController(accounts, view);
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
    await store.disconnect();
  });

  it("register → verify → login → workshop board over HTTP", async () => {
    const email = `e2e-${Date.now()}@polo.norte`;
    const password = "password1234";

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

  it("rejects register when password is shorter than the policy", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: `short-pass-${Date.now()}@polo.norte`,
        password: "password123",
        displayName: "Buddy",
      },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().success).toBe(false);
  });

  it("rejects register when display name is shorter than the policy", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: `short-name-${Date.now()}@polo.norte`,
        password: "password1234",
        displayName: "Al",
      },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().success).toBe(false);
  });
});
