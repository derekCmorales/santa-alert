import { describe, expect, it } from "vitest";
import { FormPolicy } from "./FormPolicy";
import { MinLengthRule } from "./MinLengthRule";
import {
  registerDisplayNameRule,
  registerFormPolicy,
  registerPasswordRule,
} from "./registerFormPolicy";

describe("registerFormPolicy (web)", () => {
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
    expect(registerPasswordRule.hint).toBe("Mínimo 12 caracteres");
    const issues = registerFormPolicy.validate({
      displayName: "Buddy",
      password: "password123",
    });
    expect(issues.some((issue) => issue.field === "password")).toBe(true);
  });

  it("accepts extra composed rules without changing FormPolicy", () => {
    const extra = new MinLengthRule("displayName", 10, "TOO_SHORT", "muy corto");
    const policy = new FormPolicy([extra]);
    expect(policy.validate({ displayName: "Buddy" })).toHaveLength(1);
  });
});
