import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const EMAIL_ASSET_IDS = {
  logo: "north-pole-logo",
  hero: "north-pole-hero",
  divider1: "north-pole-divider1",
  divider2: "north-pole-divider2",
  footerBg: "north-pole-footer-bg",
} as const;

export interface InlineEmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  inlineContentId: string;
}

const ASSET_FILES: Array<{
  filename: string;
  inlineContentId: string;
  contentType: string;
}> = [
  { filename: "logo.png", inlineContentId: EMAIL_ASSET_IDS.logo, contentType: "image/png" },
  { filename: "hero.png", inlineContentId: EMAIL_ASSET_IDS.hero, contentType: "image/png" },
  {
    filename: "divider1.png",
    inlineContentId: EMAIL_ASSET_IDS.divider1,
    contentType: "image/png",
  },
  {
    filename: "divider2.png",
    inlineContentId: EMAIL_ASSET_IDS.divider2,
    contentType: "image/png",
  },
  {
    filename: "footer-bg.png",
    inlineContentId: EMAIL_ASSET_IDS.footerBg,
    contentType: "image/png",
  },
];

function resolveEmailAssetsDir(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(moduleDir, "../../../../web/public/email"),
    join(process.cwd(), "../web/public/email"),
    join(process.cwd(), "apps/web/public/email"),
  ];

  for (const candidate of candidates) {
    try {
      readFileSync(join(candidate, "logo.png"));
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error("No se encontraron los assets de correo en apps/web/public/email");
}

export function loadInlineEmailAttachments(): InlineEmailAttachment[] {
  const assetsDir = resolveEmailAssetsDir();

  return ASSET_FILES.map((asset) => ({
    filename: asset.filename,
    content: readFileSync(join(assetsDir, asset.filename)),
    contentType: asset.contentType,
    inlineContentId: asset.inlineContentId,
  }));
}
