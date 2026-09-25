import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { methodNotAllowed, requireEnv, serverError } from "../_http.js";
import { fetchWithTimeout, runCheck, summarizeChecks } from "./_checks.js";

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const sendFailureAlert = async (failed, checks) => {
  const host = requireEnv("SMTP_HOST");
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Consuobra Monitor <${user}>`,
    to: process.env.MONITOR_ALERT_EMAIL || "suporte@consuobra.com.br",
    subject: `[Consuobra] Falha operacional: ${failed.join(", ")}`,
    text: [
      "O monitor automatico encontrou uma falha nos servicos essenciais.",
      "",
      ...checks.map((check) => `${check.name}: ${check.ok ? "OK" : "FALHA"} (${check.status || check.error}, ${check.latencyMs} ms)`),
      "",
      `Horario: ${new Date().toISOString()}`,
    ].join("\n"),
  });
};

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    const expected = requireEnv("CRON_SECRET");
    const received = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!safeEqual(received, expected)) return res.status(401).json({ error: "Nao autorizado." });

    const appUrl = String(process.env.PUBLIC_APP_URL || "https://consuobra.com.br").replace(/\/$/, "");
    const supabaseUrl = requireEnv("VITE_SUPABASE_URL").replace(/\/$/, "");
    const supabaseKey = requireEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
    const checks = await Promise.all([
      runCheck("site", () => fetchWithTimeout(`${appUrl}/`, { method: "HEAD" })),
      runCheck("api", () => fetchWithTimeout(`${appUrl}/api/health`, { headers: { "Cache-Control": "no-cache" } })),
      runCheck("supabase_auth", () => fetchWithTimeout(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseKey },
      })),
    ]);
    const summary = summarizeChecks(checks);

    if (!summary.ok) {
      await sendFailureAlert(summary.failed, checks).catch((error) => console.error("Monitor email failed", error));
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(summary.ok ? 200 : 503).json({
      status: summary.ok ? "operational" : "degraded",
      checkedAt: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    return serverError(res, error, "Falha ao executar monitoramento.");
  }
}

