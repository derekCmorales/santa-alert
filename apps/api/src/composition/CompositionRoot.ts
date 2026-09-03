import { RegisterElfController } from "../controllers/register-elf/RegisterElfController.js";
import { LoginElfController } from "../controllers/login-elf/LoginElfController.js";
import { VerifyElfController } from "../controllers/verify-elf/VerifyElfController.js";
import { WorkshopController } from "../controllers/workshop/WorkshopController.js";
import { Argon2CryptoGateway } from "../database/argon2/Argon2CryptoGateway.js";
import { parseDbDriver, type DbDriver } from "../database/createElfAccountGateway.js";
import type { ElfAccountGateway } from "../interactors/shared/ElfAccountGateway.js";
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
import { createMailView, parseMailDriver, type MailDriver } from "../views/mail/createMailView.js";
import type { MailView } from "../presenters/acceptance-letter/MailView.js";
import type { JsonView } from "../presenters/json/JsonView.js";

export interface AppConfig {
  jwtSecret: string;
  appBaseUrl: string;
  emailFrom: string;
  resendApiKey?: string;
  mailjetApiKey?: string;
  mailjetApiSecret?: string;
  mailDriver: MailDriver;
  dbDriver: DbDriver;
  pgliteDataDir?: string;
}

export interface AppControllers {
  register: RegisterElfController;
  login: LoginElfController;
  verify: VerifyElfController;
  workshop: WorkshopController;
}

export function buildControllers(
  accounts: ElfAccountGateway,
  config: AppConfig,
  mailViewOverride?: MailView,
): AppControllers {
  const crypto = new Argon2CryptoGateway();
  const gateway = accounts;

  const registerGenerator = new RegisterElfGenerator(gateway, crypto);
  const verifyGenerator = new VerifyElfGenerator(gateway, crypto);
  const loginGenerator = new LoginElfGenerator(gateway, crypto);
  const workshopGenerator = new WorkshopBoardGenerator();

  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);
  const tokenVerifier = new JoseSessionTokenVerifier(tokenIssuer);

  const mailView = mailViewOverride ?? createMailView(config);

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
  accounts: ElfAccountGateway,
  config: AppConfig,
  jsonView: JsonView,
  mailView?: MailView,
): RegisterElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = accounts;
  const registerGenerator = new RegisterElfGenerator(gateway, crypto);

  const mail = mailView ?? createMailView(config);

  return new RegisterElfController(
    registerGenerator,
    new JsonRegisterPresenter(jsonView),
    new AcceptanceLetterPresenter(mail, {
      appBaseUrl: config.appBaseUrl,
      emailFrom: config.emailFrom,
    }),
  );
}

export function buildLoginController(
  accounts: ElfAccountGateway,
  config: AppConfig,
  jsonView: JsonView,
): LoginElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = accounts;
  const loginGenerator = new LoginElfGenerator(gateway, crypto);
  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);

  return new LoginElfController(
    loginGenerator,
    new JsonLoginPresenter(jsonView, tokenIssuer),
  );
}

export function buildVerifyController(
  accounts: ElfAccountGateway,
  jsonView: JsonView,
): VerifyElfController {
  const crypto = new Argon2CryptoGateway();
  const gateway = accounts;
  const verifyGenerator = new VerifyElfGenerator(gateway, crypto);

  return new VerifyElfController(
    verifyGenerator,
    new JsonVerifyPresenter(jsonView),
  );
}

export function buildWorkshopController(
  config: AppConfig,
  jsonView: JsonView,
): WorkshopController {
  const tokenIssuer = new JoseSessionTokenIssuer(config.jwtSecret);
  const tokenVerifier = new JoseSessionTokenVerifier(tokenIssuer);
  const workshopGenerator = new WorkshopBoardGenerator();

  return new WorkshopController(
    workshopGenerator,
    new JsonWorkshopPresenter(jsonView),
    tokenVerifier,
  );
}

export function loadConfig(): AppConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters.");
  }

  const mailDriver = parseMailDriver(process.env.MAIL_DRIVER);
  const mailjetApiKey = process.env.MAILJET_API_KEY;
  const mailjetApiSecret = process.env.MAILJET_API_SECRET;
  const dbDriver = parseDbDriver(process.env.DB_DRIVER);
  const pgliteDataDir = process.env.PGLITE_DATA_DIR;

  if (mailDriver === "mailjet" && (!mailjetApiKey || !mailjetApiSecret)) {
    throw new Error(
      "MAILJET_API_KEY and MAILJET_API_SECRET must be set when MAIL_DRIVER=mailjet.",
    );
  }

  return {
    jwtSecret,
    appBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:5173",
    emailFrom: process.env.EMAIL_FROM ?? "North Pole HR <onboarding@resend.dev>",
    resendApiKey: process.env.RESEND_API_KEY,
    mailjetApiKey,
    mailjetApiSecret,
    mailDriver,
    dbDriver,
    pgliteDataDir: pgliteDataDir || undefined,
  };
}
