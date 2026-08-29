import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface FestiveButtonLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function FestiveButtonLink({ to, children, className }: FestiveButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`w-full font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 bg-xmas-red hover:bg-xmas-red-hover text-white shadow-md shadow-red-200/80 hover:shadow-lg hover:shadow-red-200 no-underline ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}
