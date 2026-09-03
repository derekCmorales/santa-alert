import "dotenv/config";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { z } from "zod";
import {
  buildLoginController,
  buildRegisterController,
  buildVerifyController,
  buildWorkshopController,
  loadConfig,
} from "./composition/CompositionRoot.js";
import { createElfAccountGateway } from "./database/createElfAccountGateway.js";
import {
  registerDisplayNameRule,
  registerPasswordRule,
} from "./entities/validation/registerFormPolicy.js";
import { createFastifyJsonView } from "./views/http/FastifyJsonView.js";

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

async function main() {
  const config = loadConfig();
  const store = await createElfAccountGateway(config);
  const accounts = store.gateway;
  const app = Fastify({ logger: true });

  await app.register(fastifyCors, {
    origin: [config.appBaseUrl, "http://localhost:5173"],
    credentials: true,
  });

  await app.register(fastifyRateLimit, {
    max: 30,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({ ok: true }));

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
    const controller = buildRegisterController(accounts, config, view);
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

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: "0.0.0.0" });

  const shutdown = async () => {
    await app.close();
    await store.disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => {
    void shutdown();
  });
  process.on("SIGINT", () => {
    void shutdown();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
