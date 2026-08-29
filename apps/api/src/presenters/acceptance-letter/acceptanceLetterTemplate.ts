import { EMAIL_ASSET_IDS } from "./emailAssets.js";

/**
 * Plantilla HTML de la Carta de Aceptación (diseño festivo Figma → email-safe).
 * Las imágenes usan CID inline para que carguen en clientes de correo reales.
 */
export interface AcceptanceLetterTemplateInput {
  displayName: string;
  verificationUrl: string;
}

export function renderAcceptanceLetterHtml(
  input: AcceptanceLetterTemplateInput,
): string {
  const logo = `cid:${EMAIL_ASSET_IDS.logo}`;
  const hero = `cid:${EMAIL_ASSET_IDS.hero}`;
  const divider1 = `cid:${EMAIL_ASSET_IDS.divider1}`;
  const divider2 = `cid:${EMAIL_ASSET_IDS.divider2}`;
  const footerBg = `cid:${EMAIL_ASSET_IDS.footerBg}`;
  const name = escapeHtml(input.displayName);
  const url = escapeHtml(input.verificationUrl);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Carta de Aceptación — Taller de Santa</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Poppins',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fffbf8;max-width:600px;width:100%;">
          <!-- Pre-header -->
          <tr>
            <td style="background:#f9f9f9;padding:10px 40px;text-align:right;">
              <span style="font-size:12px;color:#939393;">North Pole HR · Carta Oficial</span>
            </td>
          </tr>
          <tr><td style="height:30px;background:#ffffff;">&nbsp;</td></tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="background:#ffffff;padding:24px 20px;">
              <img src="${logo}" alt="Portal del Polo Norte" width="200" style="display:block;height:auto;max-height:70px;margin:0 auto;" />
            </td>
          </tr>
          <!-- Hero -->
          <tr>
            <td style="background:#ffffff;">
              <img src="${hero}" alt="Bienvenido al Taller de Santa" width="600" style="display:block;width:100%;max-width:600px;height:auto;" />
            </td>
          </tr>
          <tr><td style="height:15px;background:#ffffff;">&nbsp;</td></tr>
          <!-- Divider 1 -->
          <tr>
            <td align="center" style="background:#ffffff;padding:24px 20px;">
              <img src="${divider1}" alt="" width="240" style="display:block;height:40px;margin:0 auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:0 50px 30px;text-align:center;">
              <h1 style="margin:0 0 14px;font-size:24px;font-weight:600;color:#1a0a0a;line-height:34px;">
                Carta de Aceptación Oficial
              </h1>
              <p style="margin:0 0 14px;font-size:14px;color:#616161;line-height:24px;max-width:425px;display:inline-block;">
                Querido elfo <strong style="color:#1a0a0a;">${name}</strong>, el Consejo del Polo Norte
                ha revisado tu solicitud. Nos complace informarte que has sido
                <strong>preseleccionado</strong> para colaborar en la producción navideña del Taller de Santa.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#616161;line-height:24px;max-width:425px;display:inline-block;">
                Para confirmar tu plaza, abre la carta oficial con el sello de Santa haciendo clic en el botón de abajo.
                Solo entonces podrás acceder al Portal del Polo Norte.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius:999px;background:#e41a2a;">
                    <a href="${url}"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                      Abrir mi carta y verificar acceso
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:20px;">
                Este enlace expira en 24 horas. Si no solicitaste este acceso, ignora este mensaje.
              </p>
              <p style="margin:16px 0 0;font-size:18px;font-weight:600;color:#e41a2a;line-height:28px;">
                Con gratitud nevada,<br/>Departamento de Recursos Elfos
              </p>
            </td>
          </tr>
          <!-- Divider 2 -->
          <tr>
            <td align="center" style="background:#ffffff;padding:24px 20px;">
              <img src="${divider2}" alt="" width="240" style="display:block;height:40px;margin:0 auto;" />
            </td>
          </tr>
          <tr><td style="height:30px;background:#ffffff;">&nbsp;</td></tr>
          <!-- Footer -->
          <tr>
            <td style="background:#e41a2a;padding:0;position:relative;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-image:url('${footerBg}');background-size:cover;background-position:center;">
                <tr>
                  <td style="padding:96px 40px 32px;text-align:center;">
                    <div style="width:100%;max-width:520px;height:2px;background:#f1f1f1;margin:0 auto 24px;"></div>
                    <p style="margin:0;font-size:12px;color:#616161;line-height:22px;max-width:456px;display:inline-block;">
                      Portal del Polo Norte · North Pole HR Intranet<br/>
                      Intranet exclusiva para elfos · Temporada 2025
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
