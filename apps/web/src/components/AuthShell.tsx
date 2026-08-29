import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  asideTitle: string;
  asideText: string;
  badge?: string;
}

export function AuthShell({ children, asideTitle, asideText, badge }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside" aria-hidden>
        <div className="auth-aside-glow" />
        <div className="auth-aside-inner">
          {badge && <span className="auth-badge">{badge}</span>}
          <h2 className="auth-aside-title">{asideTitle}</h2>
          <p className="auth-aside-text">{asideText}</p>
          <ul className="auth-aside-steps">
            <li>
              <span>1</span> Solicita tu plaza
            </li>
            <li>
              <span>2</span> Verifica la carta
            </li>
            <li>
              <span>3</span> Entra al taller
            </li>
          </ul>
        </div>
      </aside>
      <div className="auth-main">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
