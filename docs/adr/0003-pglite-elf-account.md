# ADR 0003: PGlite como segundo ElfAccountGateway

**Estado:** Aceptado  
**Fecha:** 2026-09-02  
**Contexto:** Demostrar OCP en persistencia. El puerto `ElfAccountGateway` ya tenía `ElfAccountMapper` (Prisma + SQLite) y un fake in-memory en tests. Se pidió un segundo motor de base de datos simple.

## Decisión

Añadir `PgliteElfAccountMapper implements ElfAccountGateway`. El composition root elige el concreto con `DB_DRIVER=prisma | pglite`. Los Interactors no cambian.

PGlite es PostgreSQL embebido (WASM): motor distinto a SQLite, una tabla `ElfAccount`, sin Docker. La traducción SQL (quoted identifiers, `TIMESTAMPTZ` → `Date`, upsert por `id`) vive **dentro** del adapter (LSP).

## Alternativas consideradas

### A. Cambiar `schema.prisma` `provider` a `postgresql`

Rechazado: Prisma ya escondía el motor. Cero clases nuevas. No demuestra OCP de la aplicación (*Clean Architecture* cap. 8: extender con un concreto nuevo).

### B. Sustituir SQLite por PGlite

Rechazado: borraría una implementación real y debilitaría la prueba de OCP (extender, no reemplazar). Mismo criterio que ADR 0002 con Resend vs Mailjet.

### C. `if (DB_DRIVER === "pglite")` en los Generators

Rechazado: reabre el núcleo por cada motor.

### D. Postgres servidor + Docker Compose

Válido como motor real, rechazado aquí por “DB simple”: daemon, CI y URL de conexión. El puerto permite añadirlo después como tercer adapter.

### E. JSON file

Rechazado como motor: no es un motor SQL. Queda como fallback solo si PGlite fuera bloqueante (no lo fue).

## Consecuencias

**Positivas**

- Segundo motor sin tocar reglas de registro, login ni verify.
- Fail-fast si `DB_DRIVER` es desconocido.
- Tests de flujo sustituibles: hablan `ElfAccountGateway`.

**Negativas**

- El `switch` de creación crece con cada motor (aceptable: vive solo en `createElfAccountGateway`).
- Arranque de PGlite WASM es más lento que SQLite en el primer `PGlite.create()`.
