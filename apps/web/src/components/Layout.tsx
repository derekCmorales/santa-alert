import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { useAuth } from "../context/AuthContext";

const AUTH_PATHS = ["/", "/registro", "/carta-enviada", "/verificar"];

export function Layout({ children }: { children: ReactNode }) {
  const { elf, logout } = useAuth();
  const { pathname } = useLocation();
  const isAuthFlow = AUTH_PATHS.includes(pathname);

  if (isAuthFlow) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="layout layout--workshop">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to={elf ? "/taller" : "/"} className="brand">
            <BrandMark size={36} />
            <div>
              <strong>North Pole HR</strong>
              <span>Portal del Polo Norte</span>
            </div>
          </Link>
          {elf && (
            <button type="button" className="btn-logout" onClick={logout}>
              Cerrar sesión
            </button>
          )}
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">Intranet · Temporada 2025</footer>
    </div>
  );
}
