import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { put, head } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { methodNotAllowed, requireEnv, serverError } from "../_http.js";
import { isStorageFile, toBackupPath } from "./_storage.js";

export const config = { maxDuration: 300 };

const BUCKET = "private-files";
const PAGE_SIZE = 100;
const MAX_FILES_PER_RUN = 50;

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const listFiles = async (storage) => {
  const files = [];
  const folders = [""];

  while (folders.length) {
    const prefix = folders.shift();
    let offset = 0;
    while (true) {
      const { data, error } = await storage.from(BUCKET).list(prefix, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;

      for (const item of data || []) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (isStorageFile(item)) files.push({ ...item, path });
        else folders.push(path);
      }
      if (!data || data.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
  }

  return files;
};

const blobExists = async (pathname) => {
  try {
    await head(pathname);
    return true;
  } catch (error) {
    if (error?.status === 404 || error?.statusCode === 404 || error?.name === "BlobNotFoundError") return false;
    throw error;
  }
};

const sendAlert = async (message) => {
  const host = requireEnv("SMTP_HOST");
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Consuobra Backup <${user}>`,
    to: process.env.MONITOR_ALERT_EMAIL || "suporte@consuobra.com.br",
    subject: "[Consuobra] Falha no backup de documentos",
    text: `${message}\n\nHorario: ${new Date().toISOString()}`,
  });
};

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    const expected = requireEnv("CRON_SECRET");
    const received = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!safeEqual(received, expected)) return res.status(401).json({ error: "Nao autorizado." });

    requireEnv("BLOB_READ_WRITE_TOKEN");
    const supabase = createClient(
      requireEnv("VITE_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const files = await listFiles(supabase.storage);
    let copied = 0;
    let existing = 0;
    const failures = [];

    for (const file of files) {
      if (copied >= MAX_FILES_PER_RUN) break;
      const backupPath = toBackupPath(BUCKET, file.path);
      try {
        if (await blobExists(backupPath)) {
          existing += 1;
          continue;
        }
        const { data, error } = await supabase.storage.from(BUCKET).download(file.path);
        if (error) throw error;
        await put(backupPath, data, {
          access: "private",
          addRandomSuffix: false,
          contentType: file.metadata?.mimetype || data.type || undefined,
          multipart: Number(file.metadata?.size || data.size || 0) > 4_000_000,
        });
        copied += 1;
      } catch (error) {
        failures.push({ path: file.path, error: error?.message || "backup_failed" });
      }
    }

    if (failures.length) {
      await sendAlert(`Falharam ${failures.length} arquivo(s):\n${failures.map((item) => item.path).join("\n")}`)
        .catch((error) => console.error("Backup alert failed", error));
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(failures.length ? 503 : 200).json({
      status: failures.length ? "partial" : "completed",
      checkedAt: new Date().toISOString(),
      discovered: files.length,
      copied,
      existing,
      remaining: Math.max(0, files.length - existing - copied - failures.length),
      failed: failures.length,
    });
  } catch (error) {
    await sendAlert(error?.message || "Falha inesperada no backup.").catch(() => {});
    return serverError(res, error, "Falha ao executar backup de documentos.");
  }
}

