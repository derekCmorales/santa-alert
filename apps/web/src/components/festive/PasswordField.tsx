import { useState } from "react";
import type { InputHTMLAttributes } from "react";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
}

export function PasswordField({
  label = "Contraseña",
  hint,
  id,
  className,
  ...props
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const inputId = id ?? "password";

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-[11px] font-semibold text-xmas-muted uppercase tracking-[0.14em] mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          className={`festive-input w-full border border-gray-200/90 rounded-xl px-4 py-3 pr-[4.5rem] text-sm text-xmas-ink placeholder:text-gray-300 focus:outline-none ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-wide text-gray-400 hover:text-xmas-red transition-colors px-2 py-1 rounded-md"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? "OCULTAR" : "VER"}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{hint}</p>}
    </div>
  );
}
