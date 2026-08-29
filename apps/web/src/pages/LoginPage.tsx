import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { FestiveAlert } from "../components/festive/FestiveAlert";
import { FestiveAuthPage } from "../components/festive/FestiveAuthPage";
import { FestiveButton } from "../components/festive/FestiveButton";
import { FestiveCard } from "../components/festive/FestiveCard";
import { FestiveField } from "../components/festive/FestiveField";
import { FestiveFormDivider } from "../components/festive/FestiveFormDivider";
import { PasswordField } from "../components/festive/PasswordField";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { token, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/taller" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { body } = await api.login({ email, password });
      if (!body.success || !body.data) {
        setError(body.error?.message ?? "No pudimos iniciar sesión.");
        return;
      }
      login(body.data.accessToken, body.data.elf);
    } catch {
      setError("Error de conexión con el Polo Norte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FestiveAuthPage>
      <FestiveCard
        subtitle="Accede al Portal del Polo Norte"
        intro="Ingresa con el correo y contraseña de tu cuenta verificada."
      >
        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-5 space-y-5" noValidate>
          {error && <FestiveAlert>{error}</FestiveAlert>}

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
            hint=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <FestiveButton type="submit" loading={loading} loadingText="Entrando al taller…">
            Entrar al taller
          </FestiveButton>

          <FestiveFormDivider />

          <p className="text-center text-sm text-gray-500">
            ¿Primera vez aquí?{" "}
            <Link
              to="/registro"
              className="text-xmas-red font-semibold hover:text-xmas-red-hover transition-colors"
            >
              Solicitar plaza
            </Link>
          </p>
        </form>
      </FestiveCard>
    </FestiveAuthPage>
  );
}
