import { NextResponse } from "next/server";
import { getMachine } from "@/lib/machines";

export const runtime = "nodejs";

const LIMITS: Record<string, number> = {
  name: 100,
  company: 120,
  email: 160,
  phone: 40,
  country: 80,
  quantity: 20,
  machine: 40,
  message: 3000,
  lang: 2,
};

const MSG = {
  en: {
    invalid: "Invalid request.",
    required: "Please fill in your name, country and a short message.",
    email: "Please enter a valid email address.",
    off: "Online quotes aren't switched on yet. Please send your request on WhatsApp.",
    failed: "We couldn't send your request right now.",
  },
  ar: {
    invalid: "طلب غير صالح.",
    required: "يرجى إدخال الاسم والدولة ورسالة قصيرة.",
    email: "يرجى إدخال بريد إلكتروني صحيح.",
    off: "طلبات الأسعار عبر الموقع غير مفعّلة بعد. يرجى إرسال طلبك عبر واتساب.",
    failed: "تعذّر إرسال طلبك حالياً.",
  },
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: MSG.en.invalid }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (typeof raw.website === "string" && raw.website.trim()) return NextResponse.json({ ok: true });

  const data: Record<string, string> = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const v = raw[key];
    data[key] = typeof v === "string" ? v.trim().slice(0, max) : "";
  }

  const m = data.lang === "ar" ? MSG.ar : MSG.en;
  if (!data.name || !data.country || data.message.length < 10) return NextResponse.json({ error: m.required }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: m.email }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  if (!apiKey || !to) {
    console.warn("[quote] RESEND_API_KEY or QUOTE_TO_EMAIL not set; inquiry not emailed.");
    return NextResponse.json({ error: m.off }, { status: 503 });
  }

  const machine = getMachine("en", data.machine)?.name ?? "Not sure yet";
  const rows: [string, string][] = [
    ["Name", data.name],
    ["Company", data.company || "-"],
    ["Email", data.email],
    ["Phone / WhatsApp", data.phone || "-"],
    ["Country", data.country],
    ["Machine", machine],
    ["Quantity", data.quantity || "-"],
    ["Site language", data.lang === "ar" ? "Arabic" : "English"],
  ];
  const html = `
    <h2 style="font-family:sans-serif;color:#1A0B45">New quote request</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6E6A85">${k}</td><td style="padding:6px 0"><b>${escape(v)}</b></td></tr>`).join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escape(data.message)}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL || "X&Y3 Website <onboarding@resend.dev>",
      to: [to],
      reply_to: data.email,
      subject: `Quote request: ${machine} · ${data.name} (${data.country})`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[quote] Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: m.failed }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
