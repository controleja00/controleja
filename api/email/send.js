import nodemailer from "nodemailer";
import { badRequest, methodNotAllowed, serverError, requireEnv } from "../_http.js";

const defaultAllowedRecipients = [
  "suporte@consuobra.com.br",
  "contato@consuobra.com.br",
  "financeiro@consuobra.com.br",
];

const clean = (value, max = 1000) => String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { to, subject, body } = req.body || {};
  if (!body || String(body).trim().length < 3) return badRequest(res, "Mensagem nao informada.");

  try {
    const host = requireEnv("SMTP_HOST");
    const user = requireEnv("SMTP_USER");
    const pass = requireEnv("SMTP_PASS");
    const port = Number(process.env.SMTP_PORT || 465);
    const from = process.env.SMTP_FROM || `Consuobra <${user}>`;
    const allowedRecipients = (process.env.MAIL_ALLOWED_TO || defaultAllowedRecipients.join(","))
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const requestedTo = String(to || "").trim().toLowerCase();
    const safeTo = allowedRecipients.includes(requestedTo) ? requestedTo : allowedRecipients[0];

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: safeTo,
      replyTo: clean(req.body?.replyTo || req.body?.email || ""),
      subject: clean(subject || "Mensagem Consuobra", 180),
      text: String(body).trim().slice(0, 5000),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return serverError(res, error, "Nao foi possivel enviar o e-mail agora.");
  }
}
