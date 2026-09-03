# ADR 0001: Límites Clean Architecture para auth JWT + Resend

**Estado:** Aceptado  
**Fecha:** 2025-12-01  
**Contexto:** Práctica North Pole HR — signup verificado por correo, login JWT.

## Decisión

Adoptamos la partición de la Fig. 8.2 / 8.3 de *Clean Architecture*:

1. **Presenter `<I>` vive en el componente Controller** (no en el Interactor).
2. **Gateway `<I>` vive en el componente Interactor** (definido por las necesidades del dominio).
3. Solo **Data Structures `<DS>`** cruzan límites hacia fuera; las entidades `Elf` no salen del Interactor.
4. **JWT y Resend** son detalles de infraestructura en Views/Presenters, no en Generators.

## Alternativas consideradas

### A. Hexagonal genérico (UseCase + Ports en application/)

Equivalente conceptual, pero el curso pide alineación explícita con Fig. 8.2 (Controller / Presenter / View Model / View).

### B. JWT dentro de LoginElfGenerator

Rechazado: acoplaría el Interactor a `jose` y violaría OCP para cookies httpOnly.

### C. Resend dentro de RegisterElfGenerator

Rechazado: el correo es un canal de salida (Print/PDF en el libro), no persistencia.

## Consecuencias

**Positivas**

- Tests del Generator con gateways fake, sin red ni DB.
- Cambiar Resend → Console, Mailjet o SendGrid sin tocar reglas de negocio.
- Cambiar Prisma/SQLite → PGlite (u otro `implements ElfAccountGateway`) sin tocar Generators.
- Diagramas de clase y componente mapean 1:1 al código.

**Negativas**

- Más clases que un CRUD monolítico (aceptable para objetivos académicos).
- El Controller debe conocer la lista de Presenters (composition root).

## Cumplimiento SRP / OCP

| Principio | Evidencia |
|-----------|-----------|
| SRP | `AcceptanceLetterPresenter` solo formatea carta; `ElfAccountMapper` solo persiste |
| OCP | `ConsoleMailView`, `ResendMailView` y `MailjetMailView` intercambiables vía `MailView`; `ElfAccountMapper` y `PgliteElfAccountMapper` vía `ElfAccountGateway` |

## Plantilla de correo

El HTML está centralizado en `acceptanceLetterTemplate.ts` para que el usuario sustituya el diseño sin tocar el Generator ni el Presenter (solo la función de render si cambia la firma de datos).
