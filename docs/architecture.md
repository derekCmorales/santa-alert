# Arquitectura — Portal del Polo Norte

## Visión general

El sistema implementa **Clean Architecture** siguiendo la partición de componentes de la Fig. 8.2 y las dependencias unidireccionales de la Fig. 8.3 (*Clean Architecture*, Robert C. Martin).

El núcleo estable es el **Interactor** (Generators + entidades). Todo lo demás depende hacia adentro.

## Capas y responsabilidades

| Componente | Responsabilidad (SRP) | Ejemplo |
|------------|----------------------|---------|
| **Entities** | Invariantes de dominio | `Elf.verify()` inmutable |
| **Interactor** | Orquestación de reglas sin I/O concreto | `RegisterElfGenerator` |
| **Gateway `<I>`** | Contrato de persistencia definido por el Interactor | `ElfAccountGateway` |
| **Controller** | Traduce HTTP → Request `<DS>`, invoca Requester, dispara Presenters | `RegisterElfController` |
| **Presenter `<I>`** | Contrato de salida definido por el Controller | `RegisterElfPresenter` |
| **Presenter concreto** | Formatea Response `<DS>` → View Model `<DS>` | `JsonRegisterPresenter`, `AcceptanceLetterPresenter` |
| **View `<I>`** | Canal de entrega | `JsonView`, `MailView` |
| **View concreta** | Implementación tecnológica | `FastifyJsonView`, `ResendMailView` |
| **Mapper** | Traduce filas DB ↔ entidades | `ElfAccountMapper` |

## Regla de dependencia

```
Views → Presenters → Controllers → Interactors ← Database (Mapper)
```

El Interactor **nunca** importa Fastify, Prisma, Resend ni `jose`.

## Open/Closed en la práctica

### Canal Screen (JSON)

`JsonRegisterPresenter` + `FastifyJsonView` devuelven el envelope HTTP al cliente React.

### Canal Print (Carta)

`AcceptanceLetterPresenter` + `ResendMailView` envían la Carta de Aceptación.

Añadir `ConsoleMailView` (dev) o cambiar a SendGrid = **nueva View**, sin modificar `RegisterElfGenerator`.

### JWT fuera del Interactor

`LoginElfGenerator` solo decide `AUTHENTICATED | NOT_VERIFIED | INVALID`.

`JsonLoginPresenter` + `JoseSessionTokenIssuer` emiten el JWT en el View Model. Cambiar a cookies httpOnly = nuevo Presenter.

## Flujo de registro

```mermaid
sequenceDiagram
  actor Elfo
  participant View as FastifyJsonView
  participant Ctrl as RegisterElfController
  participant Gen as RegisterElfGenerator
  participant JsonP as JsonRegisterPresenter
  participant LetterP as AcceptanceLetterPresenter
  participant Mail as MailView

  Elfo->>View: POST /auth/register
  View->>Ctrl: handle(input)
  Ctrl->>Gen: execute(Request DS)
  Gen-->>Ctrl: Response DS
  Ctrl->>JsonP: present(response)
  JsonP->>View: JSON View Model
  alt outcome ACCEPTED
    Ctrl->>LetterP: present(response)
    LetterP->>Mail: Letter View Model
  end
```

## Estados de cuenta

```mermaid
stateDiagram-v2
  [*] --> UNVERIFIED: RegisterElfGenerator
  UNVERIFIED --> UNVERIFIED: Login NOT_VERIFIED
  UNVERIFIED --> VERIFIED: VerifyElfGenerator
  VERIFIED --> VERIFIED: Login AUTHENTICATED
```

## Seguridad

- Contraseñas: Argon2id (`Argon2CryptoGateway`)
- Token de correo: 32 bytes, SHA-256 en DB, TTL 24h, un solo uso
- JWT: HS256, expiración 1h, solo en Presenter de login
- Anti-enumeración: registro duplicado responde igual, sin carta

## Tests

| Capa | Ubicación | Estrategia |
|------|-----------|------------|
| Entities | `tests/unit/entities/` | Sin I/O |
| Generators | `tests/unit/generators/` | Gateways fake |
| Presenters | `tests/unit/presenters/` | Views fake |
| Integración | `tests/integration/` | SQLite + ConsoleMailView |

## Plantilla de correo

Archivo: `apps/api/src/presenters/acceptance-letter/acceptanceLetterTemplate.ts`

Contiene un HTML placeholder listo para reemplazar con tu diseño final.
