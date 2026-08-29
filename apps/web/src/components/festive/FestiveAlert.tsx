import type { ReactNode } from "react";

interface FestiveAlertProps {
  children: ReactNode;
}

export function FestiveAlert({ children }: FestiveAlertProps) {
  return (
    <div
      className="rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800 leading-relaxed"
      role="alert"
    >
      {children}
    </div>
  );
}
