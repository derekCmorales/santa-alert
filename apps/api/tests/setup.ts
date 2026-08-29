import { beforeEach } from "vitest";

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret-key-for-jwt-signing";
  process.env.DATABASE_URL = "file:./test.db";
  process.env.APP_BASE_URL = "http://localhost:5173";
  process.env.MAIL_DRIVER = "console";
});
