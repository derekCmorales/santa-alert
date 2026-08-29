import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const STATUS_LABELS: Record<string, string> = {
  en_progreso: "En progreso",
  listo: "Listo",
  pendiente: "Pendiente",
};

const STATS = [
  { key: "sledsReady" as const, label: "Trineos listos" },
  { key: "bearsPacked" as const, label: "Osos empacados" },
  { key: "trainsInProgress" as const, label: "Trenes en curso" },
  { key: "elvesOnShift" as const, label: "Elfos en turno" },
] as const;

export function WorkshopPage() {
  const { token, elf } = useAuth();
  const [stats, setStats] = useState({
    sledsReady: 0,
    bearsPacked: 0,
    trainsInProgress: 0,
    elvesOnShift: 0,
  });
  const [toys, setToys] = useState<
    Array<{ id: string; name: string; status: string; workshop: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const { body } = await api.workshopBoard(token);
        if (!body.success || !body.data) {
          setError(body.error?.message ?? "No pudimos cargar el tablero.");
          return;
        }
        setStats(body.data.stats);
        setToys(body.data.toys);
      } catch {
        setError("Error de conexión con el taller.");
      }
    })();
  }, [token]);

  const displayName = elf?.displayName ?? "Elfo";

  return (
    <div className="page-workshop">
      <header className="workshop-header">
        <div>
          <p className="workshop-kicker">North Pole HR</p>
          <h1 className="workshop-title">Taller de producción</h1>
          <p className="workshop-meta">
            Operador: <strong>{displayName}</strong>
          </p>
        </div>
      </header>

      {error && (
        <div className="workshop-alert" role="alert">
          {error}
        </div>
      )}

      <section className="workshop-section" aria-labelledby="workshop-summary">
        <h2 id="workshop-summary" className="workshop-section-title">
          Resumen del turno
        </h2>
        <dl className="workshop-stats">
          {STATS.map(({ key, label }) => (
            <div key={key} className="workshop-stat">
              <dt>{label}</dt>
              <dd>{stats[key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="workshop-section" aria-labelledby="workshop-lines">
        <h2 id="workshop-lines" className="workshop-section-title">
          Líneas de producción
        </h2>
        <div className="workshop-table-wrap">
          <table className="workshop-table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Línea</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {toys.map((toy) => (
                <tr key={toy.id}>
                  <td>{toy.name}</td>
                  <td>{toy.workshop}</td>
                  <td>
                    <span className={`workshop-status workshop-status--${toy.status}`}>
                      {STATUS_LABELS[toy.status] ?? toy.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
