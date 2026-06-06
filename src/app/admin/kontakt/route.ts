import { NextResponse, type NextRequest } from "next/server";

import { getContactMessageStoreInfo, listContactMessages } from "@/lib/contact-messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = checkAdminAuth(request);

  if (!authResult.ok) {
    return new NextResponse(authResult.message, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="null-noise Kontakt"',
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const [messages, storeInfo] = await Promise.all([listContactMessages(), getContactMessageStoreInfo()]);
  const body = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Kontakt-Nachrichten | null-noise</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; color: #211f1c; background: #fffaf0; }
      main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 48px 0; }
      section, article { display: grid; gap: 16px; }
      article, .panel { border: 1px solid #d8cdb8; border-radius: 8px; background: #fffdf8; padding: 20px; }
      h1, h2, h3, p { overflow-wrap: anywhere; }
      h1 { font-size: clamp(2rem, 8vw, 4rem); line-height: 1; margin: 0; }
      h2, h3, p { margin: 0; }
      .eyebrow, time { color: #6f6658; font-size: 0.95rem; }
      .message { white-space: pre-wrap; }
      .stack { display: grid; gap: 24px; }
    </style>
  </head>
  <body>
    <main class="stack">
      <header class="stack">
        <p class="eyebrow">Admin</p>
        <h1>Kontakt-Nachrichten</h1>
        <p>Gespeicherte Nachrichten aus dem Kontaktformular.</p>
      </header>
      <section class="panel" aria-labelledby="storage-heading">
        <h2 id="storage-heading">Speicher</h2>
        <p>${escapeHtml(storeInfo.label)}${storeInfo.durable ? "" : " · nicht dauerhaft"}</p>
        ${
          storeInfo.durable
            ? ""
            : `<p class="eyebrow">Diese Ablage kann bei Vercel-Neustarts oder neuen Deployments verloren gehen. Fuer dauerhaftes Archivieren braucht null-noise spaeter eine persistente Datenbank oder Storage-Anbindung.</p>`
        }
      </section>
      <section class="stack" aria-labelledby="messages-heading">
        <h2 id="messages-heading">Nachrichten</h2>
        ${
          messages.length === 0
            ? `<p class="eyebrow">Noch keine Kontakt-Nachrichten gespeichert.</p>`
            : messages
                .map(
                  (message) => `<article>
          <p><time datetime="${escapeHtml(message.submittedAt)}">${escapeHtml(formatSubmittedAt(message.submittedAt))}</time></p>
          <h3>${message.email ? `Antwort an ${escapeHtml(message.email)}` : "Ohne Antwortadresse"}</h3>
          <p class="message">${escapeHtml(message.message)}</p>
        </article>`,
                )
                .join("")
        }
      </section>
    </main>
  </body>
</html>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function checkAdminAuth(request: NextRequest) {
  const password = process.env.CONTACT_ADMIN_PASSWORD;

  if (!password) {
    return { ok: false, message: "Adminbereich ist noch nicht eingerichtet." };
  }

  const user = process.env.CONTACT_ADMIN_USER || "admin";
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return { ok: false, message: "Anmeldung erforderlich." };
  }

  const [providedUser, providedPassword] = decodeBasicCredentials(authorization);

  return {
    ok: providedUser === user && providedPassword === password,
    message: "Anmeldung erforderlich.",
  };
}

function decodeBasicCredentials(authorization: string) {
  try {
    const encoded = authorization.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return ["", ""];
    }

    return [decoded.slice(0, separatorIndex), decoded.slice(separatorIndex + 1)];
  } catch {
    return ["", ""];
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}
