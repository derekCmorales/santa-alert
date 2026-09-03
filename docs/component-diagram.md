# Diagrama de componentes — Dependencias unidireccionales (Fig. 8.3)

Todas las flechas apuntan **hacia** el Interactor (componente más estable).

## Diagrama de componentes

```mermaid
flowchart BT
  subgraph views [Views — volátiles]
    FastifyJsonView
    ReactPortal["React Portal"]
    ResendMailView
    MailjetMailView
    ConsoleMailView
  end

  subgraph presenters [Presenters]
    JsonRegisterPresenter
    JsonLoginPresenter
    JsonVerifyPresenter
    JsonWorkshopPresenter
    AcceptanceLetterPresenter
  end

  subgraph controller [Controller]
    RegisterElfController
    LoginElfController
    VerifyElfController
    WorkshopController
  end

  subgraph interactor [Interactor — estable]
    RegisterElfGenerator
    LoginElfGenerator
    VerifyElfGenerator
    WorkshopBoardGenerator
    ElfEntities["Elf · Email · AccountStatus"]
  end

  subgraph database [Database]
    ElfAccountMapper
    PgliteElfAccountMapper
    Argon2CryptoGateway
    SqliteElfDatabase
    PGlitePostgres
  end

  subgraph auth_infra [Auth infra — borde]
    JoseSessionTokenIssuer
    JoseSessionTokenVerifier
  end

  FastifyJsonView --> JsonRegisterPresenter
  FastifyJsonView --> JsonLoginPresenter
  FastifyJsonView --> JsonVerifyPresenter
  FastifyJsonView --> JsonWorkshopPresenter
  ReactPortal --> FastifyJsonView
  ResendMailView --> AcceptanceLetterPresenter
  MailjetMailView --> AcceptanceLetterPresenter
  ConsoleMailView --> AcceptanceLetterPresenter

  JsonRegisterPresenter --> RegisterElfController
  AcceptanceLetterPresenter --> RegisterElfController
  JsonLoginPresenter --> LoginElfController
  JsonVerifyPresenter --> VerifyElfController
  JsonWorkshopPresenter --> WorkshopController

  RegisterElfController --> RegisterElfGenerator
  LoginElfController --> LoginElfGenerator
  VerifyElfController --> VerifyElfGenerator
  WorkshopController --> WorkshopBoardGenerator

  ElfAccountMapper --> RegisterElfGenerator
  ElfAccountMapper --> LoginElfGenerator
  ElfAccountMapper --> VerifyElfGenerator
  PgliteElfAccountMapper --> RegisterElfGenerator
  PgliteElfAccountMapper --> LoginElfGenerator
  PgliteElfAccountMapper --> VerifyElfGenerator
  Argon2CryptoGateway --> RegisterElfGenerator
  Argon2CryptoGateway --> LoginElfGenerator
  Argon2CryptoGateway --> VerifyElfGenerator
  SqliteElfDatabase --> ElfAccountMapper
  PGlitePostgres --> PgliteElfAccountMapper

  JoseSessionTokenIssuer --> JsonLoginPresenter
  JoseSessionTokenVerifier --> WorkshopController
```

## Tabla de dependencias

| Origen | Destino | Interfaz / contrato |
|--------|---------|---------------------|
| Controller | Interactor | `*Requester` |
| Mapper | Interactor | `ElfAccountGateway` |
| CryptoGateway | Interactor | `CryptoGateway` |
| Presenter | Controller | `*Presenter` (en paquete controller) |
| View | Presenter | `JsonView` / `MailView` |
| TokenIssuer | Login Presenter | `SessionTokenIssuer` |
| TokenVerifier | Workshop Controller | `SessionTokenVerifier` |

## Componentes empaquetados (Fig. 8.2)

```mermaid
flowchart TB
  subgraph ControllerComponent [Controller component]
    RegisterElfController
    LoginElfController
    VerifyElfController
    WorkshopController
  end

  subgraph InteractorComponent [Interactor component]
    Generators["*Generator"]
    GatewaysI["Gateway interfaces"]
    Entities["Entities"]
  end

  subgraph DatabaseComponent [Database component]
    ElfAccountMapper
    PgliteElfAccountMapper
    Argon2CryptoGateway
    PrismaSQLite
    PGlitePostgres
  end

  subgraph JsonPresenterComponent [JSON Presenter component]
    JsonPresenters["Json*Presenter"]
    JsonViewI["JsonView interface"]
  end

  subgraph LetterPresenterComponent [Letter Presenter component]
    AcceptanceLetterPresenter
    MailViewI["MailView interface"]
  end

  subgraph ViewLayer [View layer]
    FastifyJsonView
    ResendMailView
    MailjetMailView
    ConsoleMailView
    ReactApp
  end

  ControllerComponent --> InteractorComponent
  DatabaseComponent --> InteractorComponent
  JsonPresenterComponent --> ControllerComponent
  LetterPresenterComponent --> ControllerComponent
  ViewLayer --> JsonPresenterComponent
  ViewLayer --> LetterPresenterComponent
```

## Por qué el Interactor no llama al Presenter

Si el Generator invocara directamente al envío de correo, el Interactor dependería de un detalle de salida y se rompería la Fig. 8.3.

El **Controller** es quien:

1. Llama al Requester (Generator).
2. Recibe el Response `<DS>`.
3. Itera los Presenters registrados (JSON + Carta).

Eso permite OCP: registrar un tercer Presenter (SMS, PDF) sin tocar el Generator.

## Correspondencia con el código

| Componente diagrama | Carpeta |
|--------------------|---------|
| Interactor | `apps/api/src/interactors/` + `entities/` |
| Controller | `apps/api/src/controllers/` |
| Presenters | `apps/api/src/presenters/` |
| Views | `apps/api/src/views/` |
| Database | `apps/api/src/database/` |
| Composition root | `apps/api/src/composition/` |
