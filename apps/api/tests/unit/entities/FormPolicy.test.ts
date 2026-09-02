import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../src/entities/errors/ValidationError.js";
import { FormPolicy } from "../../../src/entities/validation/FormPolicy.js";
import { MinLengthRule } from "../../../src/entities/validation/MinLengthRule.js";
import {
  registerDisplayNameRule,
  registerFormPolicy,
  registerPasswordRule,
} from "../../../src/entities/validation/registerFormPolicy.js";

describe("MinLengthRule", () => {
  it("accepts values at the minimum length", () => {
    const rule = new MinLengthRule("displayName", 3, "INVALID_NAME", "corto");
    expect(rule.validate("Ana")).toBeNull();
  });

  it("rejects values below the minimum after trim", () => {
    const rule = new MinLengthRule("displayName", 3, "INVALID_NAME", "corto", {
      trim: true,
    });
    expect(rule.validate("  Al  ")).toEqual({
      field: "displayName",
      code: "INVALID_NAME",
      message: "corto",
    });
  });

  it("does not trim passwords", () => {
    const rule = new MinLengthRule("password", 12, "INVALID_PASSWORD", "corta", {
      trim: false,
    });
    expect(rule.validate("12345678901 ")).toBeNull();
    expect(rule.validate("12345678901")).not.toBeNull();
  });
});

describe("FormPolicy", () => {
  it("is closed to modification: extra rules are composed, not hardcoded", () => {
    const extra = new MinLengthRule("displayName", 10, "TOO_SHORT", "muy corto");
    const policy = new FormPolicy([extra]);
    const issues = policy.validate({ displayName: "Buddy" });
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("TOO_SHORT");
  });
});

describe("registerFormPolicy", () => {
  it("requires display name of at least 3 characters", () => {
    expect(registerDisplayNameRule.minLength).toBe(3);
    const issues = registerFormPolicy.validate({
      displayName: "Al",
      password: "password1234",
    });
    expect(issues.some((issue) => issue.field === "displayName")).toBe(true);
  });

  it("requires password of at least 12 characters", () => {
    expect(registerPasswordRule.minLength).toBe(12);
    const issues = registerFormPolicy.validate({
      displayName: "Buddy",
      password: "password123",
    });
    expect(issues.some((issue) => issue.field === "password")).toBe(true);
  });

  it("accepts a valid register payload", () => {
    expect(
      registerFormPolicy.validate({
        displayName: "Ana",
        password: "password1234",
      }),
    ).toEqual([]);
  });

  it("throws ValidationError on assert with the first issue", () => {
    expect(() =>
      registerFormPolicy.assert({
        displayName: "Al",
        password: "short",
      }),
    ).toThrow(ValidationError);
  });
});
