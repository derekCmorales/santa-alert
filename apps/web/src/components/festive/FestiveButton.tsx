import type { ButtonHTMLAttributes, ReactNode } from "react";

interface FestiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function FestiveButton({
  loading,
  loadingText = "Procesando…",
  children,
  variant = "primary",
  className,
  disabled,
  type = "button",
  ...props
}: FestiveButtonProps) {
  const base =
    variant === "primary"
      ? "bg-xmas-red hover:bg-xmas-red-hover text-white shadow-md shadow-red-200/80 hover:shadow-lg hover:shadow-red-200"
      : "bg-transparent text-xmas-muted hover:text-xmas-red";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`w-full font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${base} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
