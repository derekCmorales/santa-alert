import { PrismaClient } from "@prisma/client";
import { RegisterElfController } from "../controllers/register-elf/RegisterElfController.js";
import { LoginElfController } from "../controllers/login-elf/LoginElfController.js";
import { VerifyElfController } from "../controllers/verify-elf/VerifyElfController.js";
import { WorkshopController } from "../controllers/workshop/WorkshopController.js";
import { Argon2CryptoGateway } from "../database/argon2/Argon2CryptoGateway.js";
import { ElfAccountMapper } from "../database/ElfAccountMapper.js";
import {
  JoseSessionTokenIssuer,
} from "../infrastructure/auth/JoseSessionTokenIssuer.js";
import { JoseSessionTokenVerifier } from "../infrastructure/auth/SessionTokenVerifier.js";
import { LoginElfGenerator } from "../interactors/login-elf/LoginElfGenerator.js";
import { RegisterElfGenerator } from "../interactors/register-elf/RegisterElfGenerator.js";
import { VerifyElfGenerator } from "../interactors/verify-elf/VerifyElfGenerator.js";
import { WorkshopBoardGenerator } from "../interactors/workshop-board/WorkshopBoardGenerator.js";
import { AcceptanceLetterPresenter } from "../presenters/acceptance-letter/AcceptanceLetterPresenter.js";
import { JsonLoginPresenter } from "../presenters/json/JsonLoginPresenter.js";
import { JsonRegisterPresenter } from "../presenters/json/JsonRegisterPresenter.js";
import { JsonVerifyPresenter } from "../presenters/json/JsonVerifyPresenter.js";
import { JsonWorkshopPresenter } from "../presenters/json/JsonWorkshopPresenter.js";
import { ConsoleMailView } from "../views/mail/ConsoleMailView.js";
import { ResendMailView } from "../views/mail/ResendMailView.js";
import type { MailView } from "../presenters/acceptance-letter/MailView.js";

export interface AppConfig {
  jwtSecret: string;
  appBaseUrl: string;
  emailFrom: string;
  resendApiKey?: string;
  mailDriver: "console" | "resend";
}

export interface AppControllers {
  register: RegisterElfController;
  login: LoginElfController;
  verify: VerifyElfController;
  workshop: WorkshopController;
}

export function buildControllers(
  db: PrismaClient,
  config: AppConfig,
  mailViewOverride?: MailView,
): AppControllers {
  const crypto = new Argon2CryptoGateway();
  const gateway = new ElfAccountMapper(db);

  const registerGenerator = new RegisterElfGenerator(gateway, crypto);
  const verifyGenerator = new VerifyElfGenerator(gateway, crypto);
  const loginGenerator = new LoginElfGenerator(gateway, crypto);
  const workshopGenerator = new WorkshopBoardGenerator();

  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);
  const tokenVerifier = new JoseSessionTokenVerifier(tokenIssuer);

  const mailView =
    mailViewOverride ??
    (config.mailDriver === "resend" && config.resendApiKey
      ? new ResendMailView(config.resendApiKey)
      : new ConsoleMailView());

  const letterPresenter = new AcceptanceLetterPresenter(mailView, {
    appBaseUrl: config.appBaseUrl,
    emailFrom: config.emailFrom,
  });

  return {
    register: new RegisterElfController(
      registerGenerator,
      new JsonRegisterPresenter({ render: () => {} } as never),
      letterPresenter,
    ),
    login: new LoginElfController(
      loginGenerator,
      new JsonLoginPresenter({ render: () => {} } as never, tokenIssuer),
    ),
    verify: new VerifyElfController(
      verifyGenerator,
      new JsonVerifyPresenter({ render: () => {} } as never),
    ),
    workshop: new WorkshopController(
      workshopGenerator,
      new JsonWorkshopPresenter({ render: () => {} } as never),
      tokenVerifier,
    ),
  };
}

export function buildRegisterController(
  db: PrismaClient,
  config: AppConfig,
  jsonView: { render: (m: unknown) => void },
  mailView?: MailView,
): RegisterElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = new ElfAccountMapper(db);
  const registerGenerator = new RegisterElfGenerator(gateway, crypto);

  const mail =
    mailView ??
    (config.mailDriver === "resend" && config.resendApiKey
      ? new ResendMailView(config.resendApiKey)
      : new ConsoleMailView());

  return new RegisterElfController(
    registerGenerator,
    new JsonRegisterPresenter(jsonView as never),
    new AcceptanceLetterPresenter(mail, {
      appBaseUrl: config.appBaseUrl,
      emailFrom: config.emailFrom,
    }),
  );
}

export function buildLoginController(
  db: PrismaClient,
  config: AppConfig,
  jsonView: { render: (m: unknown) => void },
): LoginElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = new ElfAccountMapper(db);
  const loginGenerator = new LoginElfGenerator(gateway, crypto);
  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);

  return new LoginElfController(
    loginGenerator,
    new JsonLoginPresenter(jsonView as never, tokenIssuer),
  );
}

export function buildVerifyController(
  db: PrismaClient,
  jsonView: { render: (m: unknown) => void },
): VerifyElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = new ElfAccountMapper(db);
  const verifyGenerator = new VerifyElfGenerator(gateway, crypto);

  return new VerifyElfController(
    verifyGenerator,
    new JsonVerifyPresenter(jsonView as never),
  );
}

export function buildWorkshopController(
  config: AppConfig,
  jsonView: { render: (m: unknown) => void },
): WorkshopController {
  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);
  const tokenVerifier = new JoseSessionTokenVerifier(tokenIssuer);
  const workshopGenerator = new WorkshopBoardGenerator();

  return new WorkshopController(
    workshopGenerator,
    new JsonWorkshopPresenter(jsonView as never),
    tokenVerifier,
  );
}

export function loadConfig(): AppConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters.");
  }

  return {
    jwtSecret,
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
    emailFrom: process.env.EMAIL_FROM ?? "North Pole HR <onboarding@resend.dev>",
    resendApiKey: process.env.RESEND_API_KEY,
    mailDriver: process.env.MAIL_DRIVER === "resend" ? "resend" : "console",
  };
}
