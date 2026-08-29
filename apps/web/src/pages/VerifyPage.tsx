import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { FestiveAuthPage } from "../components/festive/FestiveAuthPage";
import { FestiveButtonLink } from "../components/festive/FestiveButtonLink";
import { FestiveCard } from "../components/festive/FestiveCard";

export function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se encontró el enlace de verificación.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { body } = await api.verify(token);
        if (cancelled) return;

        if (body.success) {
          setStatus("success");
          setMessage(
            typeof body.data?.message === "string"
              ? body.data.message
              : "Tu cuenta ha sido verificada correctamente.",
          );
          setTimeout(() => setVisible(true), 80);
        } else {
          setStatus("error");
          setMessage(body.error?.message ?? "No pudimos verificar la carta.");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Error de conexión con el Polo Norte.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "loading") {
    return (
      <FestiveAuthPage variant="cream">
        <FestiveCard subtitle="Validando tu carta de aceptación">
          <div className="px-8 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 ring-4 ring-red-50/80">
              <svg className="animate-spin h-6 w-6 text-xmas-red" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-xmas-ink mb-2">Verificando</h1>
            <p className="text-sm text-xmas-muted leading-relaxed" aria-live="polite">
              Estamos confirmando tu enlace de acceso al taller.
            </p>
          </div>
        </FestiveCard>
      </FestiveAuthPage>
    );
  }

  if (status === "error") {
    return (
      <FestiveAuthPage variant="cream">
        <FestiveCard subtitle="No se pudo completar la verificación">
          <div className="px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 text-xl font-bold text-xmas-red ring-4 ring-red-50">
              !
            </div>
            <h1 className="text-lg font-semibold text-xmas-ink mb-3">Verificación fallida</h1>
            <div
              className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800 mb-6 leading-relaxed"
              role="alert"
            >
              {message}
            </div>
            <FestiveButtonLink to="/registro">Volver al registro</FestiveButtonLink>
          </div>
        </FestiveCard>
      </FestiveAuthPage>
    );
  }

  return (
    <FestiveAuthPage variant="cream">
      <div
        className={`w-full max-w-[420px] text-center transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="mb-7">
          <div className="w-[104px] h-[104px] rounded-full bg-xmas-red flex items-center justify-center mx-auto shadow-lg shadow-red-200/60 animate-check-pop ring-4 ring-red-100">
            <svg width="48" height="48" viewBox="0 0 52 52" fill="none" aria-hidden>
              <path
                d="M10 26L22 38L42 14"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-xmas-red mb-2">
          Verificación exitosa
        </p>
        <h1 className="text-[1.75rem] font-semibold text-xmas-ink mb-3 tracking-tight leading-tight">
          Cuenta activada
        </h1>
        <p className="text-xmas-muted text-sm leading-relaxed mb-2">{message}</p>
        <p className="text-sm font-medium text-xmas-ink mb-8">
          Ya puedes acceder al Taller de Santa.
        </p>

        <FestiveButtonLink to="/">Continuar al inicio de sesión</FestiveButtonLink>
      </div>
    </FestiveAuthPage>
  );
}
