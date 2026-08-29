import type { ReactNode } from "react";

interface FestiveCardProps {
  children: ReactNode;
  subtitle?: string;
  intro?: string;
}

export function FestiveCard({ children, subtitle, intro }: FestiveCardProps) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white rounded-2xl festive-card-shadow overflow-hidden ring-1 ring-black/5">
        <div className="relative bg-gradient-to-b from-xmas-red to-xmas-red-hover px-8 py-7 text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-30%,rgba(255,255,255,0.14),transparent_65%)]"
            aria-hidden
          />
          <div className="absolute bottom-0 left-8 right-8 h-px bg-white/20" aria-hidden />
          <img
            src="/auth/logo.png"
            alt="Portal del Polo Norte"
            className="relative h-[52px] mx-auto object-contain drop-shadow-sm"
          />
          {subtitle && (
            <p className="relative mt-3 text-red-50/95 text-[13px] font-medium tracking-wide leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {intro && (
          <p className="px-8 pt-6 pb-0 text-[13px] text-xmas-muted leading-relaxed text-center">
            {intro}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
