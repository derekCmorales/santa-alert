# ADR 0002: Mailjet como tercer MailView

**Estado:** Aceptado  
**Fecha:** 2026-09-02  
**Contexto:** Demostrar OCP en el canal de correo de la Carta de Aceptación. El puerto `MailView` ya tenía `ConsoleMailView` y `ResendMailView`.

## Decisión

Añadir `MailjetMailView implements MailView`. El composition root elige el concreto con `MAIL_DRIVER=mailjet | resend | console`. El Interactor y `AcceptanceLetterPresenter` no cambian.

La traducción Mailjet (From `{ Email, Name }`, `HTMLPart`, `InlinedAttachments` + `ContentID`) vive **dentro** del adapter (LSP: el cliente del puerto no conoce el JSON del vendor).

El envío usa Send API v3.1 por HTTPS + Basic auth (el mismo contrato que envuelve el SDK `node-mailjet`).

## Alternativas consideradas

### A. Sustituir Resend por Mailjet

Rechazado: borraría una implementación real y debilitaría la prueba de OCP (extender, no reemplazar).

### B. `if (MAIL_DRIVER === "mailjet")` en `AcceptanceLetterPresenter` o el Generator

Rechazado: reabre el núcleo por cada vendor (*Clean Architecture*, cap. 8).

### C. Dependencia `node-mailjet`

Equivalente funcional. Se evitó acoplar el adapter a un cliente CJS; el protocolo HTTP es el detalle estable del vendor.

## Consecuencias

**Positivas**

- Tercer driver sin tocar reglas de registro.
- Fail-fast si `MAIL_DRIVER=mailjet` y faltan claves.
- `MAIL_DRIVER` desconocido ya no cae a consola.

**Negativas**

- Hay que verificar el remitente en el dashboard de Mailjet.
- El `switch` de creación crece con cada vendor (aceptable: vive solo en `createMailView`).
