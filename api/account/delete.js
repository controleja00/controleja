import { authenticateRequest } from "../_auth.js";
import { badRequest, methodNotAllowed, requireEnv, serverError } from "../_http.js";
import { isRecentLogin, listUserFiles, matchesDeleteConfirmation } from "./_account.js";
import { del, list } from "@vercel/blob";

const cancelBilling = async (admin, userId) => {
  const { data, error } = await admin.from("subscriptions").select("provider_subscription_id,status").eq("user_id", userId).in("status", ["active", "trialing", "past_due"]);
  if (error) throw error;
  for (const subscription of data || []) {
    if (!subscription.provider_subscription_id) continue;
    const baseUrl = String(process.env.ASAAS_API_URL || "https://api.asaas.com/v3").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/subscriptions/${encodeURIComponent(subscription.provider_subscription_id)}`, {
      method: "DELETE",
      headers: { access_token: requireEnv("ASAAS_API_KEY"), "User-Agent": "Consuobra/1.0" },
    });
    if (!response.ok && response.status !== 404) throw new Error("Nao foi possivel cancelar a assinatura antes da exclusao.");
  }
};

const deleteBackups = async (userId) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  for (const bucket of ["app-files", "private-files"]) {
    let cursor;
    do {
      const page = await list({ prefix: `supabase-storage/${bucket}/${userId}/`, cursor, limit: 1000 });
      if (page.blobs?.length) await del(page.blobs.map((blob) => blob.url));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }
};

export default async function handler(req, res) {
  if (req.method !== "DELETE") return methodNotAllowed(res);
  try {
    const { user, admin, error } = await authenticateRequest(req);
    if (error) return res.status(401).json({ error });
    if (!matchesDeleteConfirmation(req.body?.confirmation, user.email)) return badRequest(res, "Digite seu e-mail exatamente para confirmar.");
    if (!isRecentLogin(user.last_sign_in_at)) return res.status(401).json({ error: "Por seguranca, saia e entre novamente antes de excluir a conta." });

    await cancelBilling(admin, user.id);
    for (const bucket of ["app-files", "private-files"]) {
      const files = await listUserFiles(admin.storage, bucket, user.id);
      for (let index = 0; index < files.length; index += 100) {
        const { error: removeError } = await admin.storage.from(bucket).remove(files.slice(index, index + 100).map((file) => file.path));
        if (removeError) throw removeError;
      }
    }
    await deleteBackups(user.id);
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true });
  } catch (error) {
    return serverError(res, error, error.message === "Nao foi possivel cancelar a assinatura antes da exclusao."
      ? error.message
      : "Nao foi possivel excluir sua conta agora.");
  }
}
