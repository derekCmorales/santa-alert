# Diagrama de clases — Registro de elfo (Fig. 8.2)

Este diagrama replica la partición del libro: **Controller | Interactor | Database | Screen Presenter | Letter Presenter | Views**.

## Diagrama principal

```mermaid
classDiagram
  direction LR

  class RegisterElfController {
    -requester: RegisterElfRequester
    -jsonPresenter: JsonRegisterPresenter
    -letterPresenter: AcceptanceLetterPresenter
    +handle(httpInput) void
  }

  class RegisterElfRequester {
    <<interface>>
    +execute(request) RegisterElfResponse
  }
  class RegisterElfRequest {
    <<DS>>
    +email: string
    +password: string
    +displayName: string
  }
  class RegisterElfResponse {
    <<DS>>
    +outcome: ACCEPTED | DUPLICATE_SILENT
    +email: string
    +rawVerificationToken: string
  }
  class RegisterElfGenerator {
    +execute(request) RegisterElfResponse
  }
  class ElfAccountGateway {
    <<interface>>
    +findByEmail(email) Elf
    +save(elf) void
  }
  class CryptoGateway {
    <<interface>>
    +hashPassword(plain) string
    +generateVerificationToken() GeneratedToken
    +hashVerificationToken(raw) string
    +now() Date
  }
  class Elf {
    +register() Elf
    +verify(now) Elf
    +assertCanLogin() void
  }
  class Email {
    <<VO>>
    +create(raw) Email
  }
  class AccountStatus {
    <<enumeration>>
    UNVERIFIED
    VERIFIED
  }

  class ElfAccountMapper {
    +findByEmail(email) Elf
    +save(elf) void
  }
  class SqliteElfDatabase {
    +elfAccount: Table
  }

  class JsonRegisterPresenter {
    +present(response) void
  }
  class RegisterJsonViewModel {
    <<DS>>
    +success: boolean
    +data: object
  }
  class JsonView {
    <<interface>>
    +render(model) void
  }
  class FastifyJsonView {
    +render(model) void
  }

  class AcceptanceLetterPresenter {
    +present(response) void
  }
  class LetterViewModel {
    <<DS>>
    +to: string
    +subject: string
    +html: string
  }
  class MailView {
    <<interface>>
    +render(model) void
  }
  class ResendMailView {
    +render(model) void
  }
  class ConsoleMailView {
    +render(model) void
  }

  RegisterElfController --> RegisterElfRequester
  RegisterElfController --> JsonRegisterPresenter
  RegisterElfController --> AcceptanceLetterPresenter
  RegisterElfGenerator ..|> RegisterElfRequester
  RegisterElfGenerator --> ElfAccountGateway
  RegisterElfGenerator --> CryptoGateway
  RegisterElfGenerator --> Elf
  Elf --> AccountStatus
  Elf --> Email
  ElfAccountMapper ..|> ElfAccountGateway
  ElfAccountMapper --> SqliteElfDatabase
  JsonRegisterPresenter --> JsonView
  FastifyJsonView ..|> JsonView
  AcceptanceLetterPresenter --> MailView
  ResendMailView ..|> MailView
  ConsoleMailView ..|> MailView
```

## Login y Verify (misma plantilla)

### Login

| Clase | Rol |
|-------|-----|
| `LoginElfController` | HTTP → Request DS |
| `LoginElfGenerator` | Requester: credenciales + estado VERIFIED |
| `JsonLoginPresenter` | Response → JWT en View Model |
| `JoseSessionTokenIssuer` | Infra: firma JWT (no en Interactor) |

### Verify

| Clase | Rol |
|-------|-----|
| `VerifyElfController` | HTTP → `{ rawToken }` |
| `VerifyElfGenerator` | Valida hash, expiración, marca VERIFIED |
| `JsonVerifyPresenter` | Response → mensaje de bienvenida |

### Workshop

| Clase | Rol |
|-------|-----|
| `WorkshopController` | Extrae Bearer, verifica JWT |
| `WorkshopBoardGenerator` | Datos mock del taller |
| `JsonWorkshopPresenter` | Tablero → JSON |

## SRP por clase

| Clase | Una razón de cambiar |
|-------|---------------------|
| `Elf` | Invariantes de cuenta |
| `RegisterElfGenerator` | Proceso de alta |
| `AcceptanceLetterPresenter` | Copy/HTML de la carta |
| `acceptanceLetterTemplate.ts` | Diseño visual del correo |
| `ResendMailView` | SDK Resend |
| `JsonRegisterPresenter` | Formato JSON / códigos HTTP |
| `ElfAccountMapper` | Esquema SQL |
| `RegisterElfController` | Cableado request + presenters |

## OCP

- Nuevo canal de correo → `implements MailView`
- Nuevo formato de API → `implements RegisterElfPresenter` o nuevo Presenter JSON
- Nuevo almacén → `implements ElfAccountGateway`

Los Generators permanecen cerrados a modificación.
