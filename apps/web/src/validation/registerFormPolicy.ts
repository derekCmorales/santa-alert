import { FormPolicy } from "./FormPolicy";
import { MinLengthRule } from "./MinLengthRule";

export const registerDisplayNameRule = new MinLengthRule(
  "displayName",
  3,
  "INVALID_NAME",
  "El nombre del elfo es demasiado corto.",
  { trim: true },
);

export const registerPasswordRule = new MinLengthRule(
  "password",
  12,
  "INVALID_PASSWORD",
  "La contraseña debe tener al menos 12 caracteres.",
  { trim: false },
);

export const registerFormPolicy = new FormPolicy([
  registerDisplayNameRule,
  registerPasswordRule,
]);
