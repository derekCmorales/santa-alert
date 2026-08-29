import type { ReactNode } from "react";
import { useMemo } from "react";

interface FestiveAuthPageProps {
  children: ReactNode;
  variant?: "forest" | "cream";
}

export function FestiveAuthPage({ children, variant = "forest" }: FestiveAuthPageProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: `${(i * 4.7) % 100}%`,
        delay: `${(i * 0.35) % 5}s`,
        duration: `${7 + (i % 4)}s`,
        size: i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
        opacity: 0.25 + (i % 5) * 0.08,
      })),
    [],
  );

  const bgClass = variant === "forest" ? "festive-forest-bg" : "festive-cream-bg";

  return (
    <div
      className={`festive-page festive-grain relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-10 ${bgClass}`}
    >
      {variant === "forest" &&
        particles.map((p) => (
          <span
            key={p.id}
            className="festive-snowflake pointer-events-none fixed top-0 animate-snowfall"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
            aria-hidden
          />
        ))}

      {variant === "forest" && (
        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" aria-hidden>
          {[...Array(14)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-xmas-green"
              style={{
                left: `${i * 7.5}%`,
                width: `${28 + (i % 3) * 12}px`,
                height: `${52 + (i % 4) * 18}px`,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                opacity: 0.55 + (i % 3) * 0.12,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 w-full flex justify-center animate-float-up">{children}</div>
    </div>
  );
}
