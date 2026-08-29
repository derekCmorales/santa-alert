import type { InputHTMLAttributes } from "react";

interface FestiveFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function FestiveField({ label, hint, id, className, ...props }: FestiveFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-[11px] font-semibold text-xmas-muted uppercase tracking-[0.14em] mb-2"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`festive-input w-full border border-gray-200/90 rounded-xl px-4 py-3 text-sm text-xmas-ink placeholder:text-gray-300 focus:outline-none ${className ?? ""}`}
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">{hint}</p>}
    </div>
  );
}
