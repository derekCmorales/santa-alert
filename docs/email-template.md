# Plantilla de correo — Carta de Aceptación

## Ubicación

```
apps/api/src/presenters/acceptance-letter/acceptanceLetterTemplate.ts
```

## Función

```typescript
renderAcceptanceLetterHtml(input: {
  displayName: string;
  verificationUrl: string;
}): string
```

Las imágenes se adjuntan inline (CID) desde `apps/web/public/email/` al enviar el correo.

## Cómo reemplazar con tu diseño

1. Abre `acceptanceLetterTemplate.ts`.
2. Sustituye el HTML dentro de `renderAcceptanceLetterHtml`.
3. Mantén los parámetros `displayName` y `verificationUrl` (o extiende la interfaz si necesitas más datos).
4. El asunto del correo se define en `AcceptanceLetterPresenter` (`subject`).

## Variables disponibles

| Variable | Origen | Uso |
|----------|--------|-----|
| `displayName` | Registro del elfo | Saludo personalizado |
| `verificationUrl` | `{APP_BASE_URL}/verificar?token={raw}` | CTA de verificación |

Las imágenes (`logo.png`, `hero.png`, etc.) viven en `apps/web/public/email/` y se incrustan como adjuntos CID al enviar con Resend, para que carguen en Gmail/Outlook sin depender de una URL pública.

## Nota de seguridad

El token crudo **nunca** se incluye en el JSON de la API. Solo viaja en el `RegisterElfResponse` hacia `AcceptanceLetterPresenter` → `MailView`.

## Vista previa en desarrollo

Con `MAIL_DRIVER=console`, el link de verificación se imprime en la terminal del API al registrar un elfo. Con `MAIL_DRIVER=mailjet` o `resend`, la misma carta sale por el adapter elegido (`MailView`).
