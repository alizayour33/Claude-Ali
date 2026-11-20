import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Kind = "project" | "support" | "partner";

const KINDS: Record<Kind, { prefix: string; label: string; required: string[]; envTo: string }> = {
  project: { prefix: "PRJ", label: "Project enquiry", required: ["name", "company", "country", "email", "description"], envTo: "LEADS_SALES_EMAIL" },
  support: { prefix: "SUP", label: "Support request", required: ["company", "name", "email", "country", "product", "category", "urgency", "description"], envTo: "LEADS_SUPPORT_EMAIL" },
  partner: { prefix: "PTN", label: "Partner inquiry", required: ["country", "company", "name", "email", "partnerType", "message"], envTo: "LEADS_PARTNER_EMAIL" },
};

const MAX_FILES = 3;
const MAX_BYTES = 4 * 1024 * 1024;
const FILE_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "application/pdf": ["pdf"],
  "video/mp4": ["mp4"],
};

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Best-effort rate limit per IP (per server instance). Use a shared store such as Upstash for strict limits. */
const hits = new Map<string, number[]>();
function limited(ip: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

function reference(prefix: string) {
  const d = new Date();
  const date = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[b % 31]).join("");
  return `XY3-${prefix}-${date}-${rand}`;
}

/** Route by inquiry type, then by country if LEADS_COUNTRY_ROUTES has a match, e.g. {"united arab emirates":"gulf@example.com"}. */
function recipient(kind: Kind, country: string) {
  try {
    const routes = JSON.parse(process.env.LEADS_COUNTRY_ROUTES ?? "{}") as Record<string, string>;
    const hit = routes[country.trim().toLowerCase()];
    if (hit) return hit;
  } catch {
    console.warn("[lead] LEADS_COUNTRY_ROUTES is not valid JSON; ignoring it.");
  }
  return process.env[KINDS[kind].envTo] || process.env.LEADS_TO_EMAIL || "";
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "The request could not be read." }, { status: 400 });
  }

  const kind = String(form.get("kind") ?? "") as Kind;
  const cfg = KINDS[kind];
  if (!cfg) return NextResponse.json({ error: "Unknown form." }, { status: 400 });

  const ref = reference(cfg.prefix);
  // Honeypot: pretend success so bots learn nothing.
  if (String(form.get("company_url") ?? "").trim()) return NextResponse.json({ reference: ref });

  const data: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string" && key !== "kind" && key !== "company_url") data[key] = value.trim().slice(0, key === "description" || key === "message" ? 4000 : 300);
  }

  const missing = cfg.required.filter((k) => !data[k]);
  if (missing.length) return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (data.consent !== "yes") return NextResponse.json({ error: "Please confirm the consent checkbox." }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return NextResponse.json({ error: "Please attach at most 3 files." }, { status: 400 });
  if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return NextResponse.json({ error: "The files are larger than 4 MB in total." }, { status: 400 });
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FILE_TYPES[f.type]?.includes(ext)) return NextResponse.json({ error: "Only JPG, PNG, WebP, PDF and MP4 files can be attached." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = recipient(kind, data.country ?? "");
  if (!apiKey || !to) {
    console.warn(`[lead] ${ref}: email is not configured (RESEND_API_KEY / ${cfg.envTo} / LEADS_TO_EMAIL).`);
    // Never drop real leads silently in production. Previews and local runs show the success state for review.
    if (process.env.VERCEL_ENV === "production") {
      return NextResponse.json({ error: "Online requests aren't switched on yet. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ reference: ref, demo: true });
  }

  const from = process.env.LEADS_FROM_EMAIL || "X&Y3 Website <onboarding@resend.dev>";
  const source = Object.entries(data).filter(([k]) => k.startsWith("src_"));
  const main = Object.entries(data).filter(([k]) => !k.startsWith("src_") && k !== "consent");
  const row = ([k, v]: [string, string]) =>
    `<tr><td style="padding:5px 16px 5px 0;color:#6B6560;vertical-align:top">${escape(k.replace(/^src_/, ""))}</td><td style="padding:5px 0;white-space:pre-wrap"><b>${escape(v || "-")}</b></td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1C1B19">
    <h2 style="margin:0 0 4px">${cfg.label}</h2><p style="margin:0 0 16px;color:#C2500F"><b>${ref}</b></p>
    <table style="border-collapse:collapse">${main.map(row).join("")}</table>
    ${source.length ? `<h3 style="margin:20px 0 6px;font-size:13px;color:#6B6560">Source</h3><table style="border-collapse:collapse;font-size:13px">${source.map(row).join("")}</table>` : ""}
  </div>`;

  try {
    const attachments = await Promise.all(
      files.map(async (f) => ({ filename: f.name.replace(/[^\w.\- ]+/g, "_").slice(0, 80), content: Buffer.from(await f.arrayBuffer()).toString("base64") })),
    );
    await sendEmail(apiKey, {
      from,
      to: [to],
      reply_to: data.email,
      subject: `[${ref}] ${cfg.label}: ${data.company || data.name} (${data.country})`,
      html,
      attachments,
    });
  } catch (err) {
    console.error(`[lead] ${ref}: delivery failed`, err);
    return NextResponse.json({ error: "We couldn't send your request right now. Please try again in a few minutes." }, { status: 502 });
  }

  // Transactional confirmation to the sender. Fixed text only, so the form can't be used to send arbitrary content.
  try {
    await sendEmail(apiKey, {
      from,
      to: [data.email],
      subject: `X&Y3 received your request (${ref})`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1C1B19"><p>Thank you for contacting X&amp;Y3.</p><p>We received your ${cfg.label.toLowerCase()}. Your reference number is <b>${ref}</b>. Please quote it in any follow-up.</p><p>X&amp;Y3</p></div>`,
    });
  } catch (err) {
    console.warn(`[lead] ${ref}: confirmation email failed`, err);
  }

  return NextResponse.json({ reference: ref });
}
