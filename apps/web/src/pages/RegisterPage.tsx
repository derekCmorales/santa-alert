import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { FestiveAlert } from "../components/festive/FestiveAlert";
import { FestiveAuthPage } from "../components/festive/FestiveAuthPage";
import { FestiveButton } from "../components/festive/FestiveButton";
import { FestiveCard } from "../components/festive/FestiveCard";
import { FestiveField } from "../components/festive/FestiveField";
import { FestiveFormDivider } from "../components/festive/FestiveFormDivider";
import { PasswordField } from "../components/festive/PasswordField";
import {
  registerDisplayNameRule,
  registerFormPolicy,
  registerPasswordRule,
} from "../validation/registerFormPolicy";

export function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const issues = registerFormPolicy.validate({ displayName, password });
    if (issues[0]) {
      setError(issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const { body } = await api.register({ displayName, email, password });
      if (!body.success) {
        setError(body.error?.message ?? "No pudimos registrar tu solicitud.");
        return;
      }
      navigate("/carta-enviada", { state: { email } });
    } catch {
      setError("Error de conexión con el Polo Norte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FestiveAuthPage>
      <FestiveCard
        subtitle="Solicita tu plaza en el Taller de Santa"
        intro="Completa el formulario y recibirás la Carta de Aceptación Oficial en tu correo."
      >
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-5" noValidate>
          {error && <FestiveAlert>{error}</FestiveAlert>}

          <FestiveField
            label="Nombre del elfo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ej. Buddy el Ayudante"
            required
            minLength={registerDisplayNameRule.minLength}
            hint={registerDisplayNameRule.hint}
            autoComplete="name"
          />
          <FestiveField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="elfo@polo.norte"
            required
            autoComplete="email"
          />
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={registerPasswordRule.minLength}
            hint={registerPasswordRule.hint}
            autoComplete="new-password"
          />

          <FestiveButton
            type="submit"
            loading={loading}
            loadingText="Enviando solicitud…"
            className="mt-1"
          >
            Solicitar plaza
          </FestiveButton>

          <FestiveFormDivider />

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/"
              className="text-xmas-red font-semibold hover:text-xmas-red-hover transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </form>
      </FestiveCard>
    </FestiveAuthPage>
  );
}
