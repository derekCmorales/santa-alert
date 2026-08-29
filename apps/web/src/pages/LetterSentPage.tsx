import { Link, useLocation } from "react-router-dom";
import { FestiveAuthPage } from "../components/festive/FestiveAuthPage";
import { FestiveButtonLink } from "../components/festive/FestiveButtonLink";

function MailIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="6" y="12" width="36" height="26" rx="3" stroke="#e41a2a" strokeWidth="2" fill="white" />
      <path d="M6 15l18 13 18-13" stroke="#e41a2a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LetterSentPage() {
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const email = state?.email;

  return (
    <FestiveAuthPage variant="cream">
      <div className="w-full max-w-[420px] text-center">
        <div className="mb-7">
          <div className="w-[88px] h-[88px] rounded-full bg-white border border-red-100 flex items-center justify-center mx-auto shadow-sm ring-4 ring-red-50">
            <MailIcon />
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-xmas-red mb-2">
          Carta enviada
        </p>
        <h1 className="text-[1.65rem] font-semibold text-xmas-ink mb-2 tracking-tight leading-tight">
          Revisa tu bandeja de entrada
        </h1>
        <p className="text-xmas-muted text-sm leading-relaxed mb-1">
          Enviamos la <strong className="text-xmas-ink font-medium">Carta de Aceptación Oficial</strong> a
        </p>
        {email ? (
          <p className="text-xmas-red font-semibold text-sm mb-7 break-all">{email}</p>
        ) : (
          <p className="text-xmas-red font-semibold text-sm mb-7">tu correo</p>
        )}

        <div className="bg-white border border-gray-100/80 rounded-2xl p-5 mb-6 text-left shadow-sm">
          <p className="text-[11px] font-semibold text-xmas-muted uppercase tracking-[0.14em] mb-3">
            Qué sigue
          </p>
          <ol className="space-y-3">
            {[
              "Abre el correo del Departamento de Recursos Elfos",
              'Haz clic en "Abrir mi carta y verificar acceso"',
              "Tu cuenta quedará activa y podrás iniciar sesión",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-gray-700 leading-snug">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-xmas-red text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <FestiveButtonLink to="/">Ir a iniciar sesión</FestiveButtonLink>

        <Link
          to="/registro"
          className="inline-block mt-4 text-sm text-xmas-muted hover:text-xmas-red font-medium transition-colors py-2"
        >
          Volver al registro
        </Link>

        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          El enlace de verificación expira en 24 horas.
        </p>
      </div>
    </FestiveAuthPage>
  );
}
